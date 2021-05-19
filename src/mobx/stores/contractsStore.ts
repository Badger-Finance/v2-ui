import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { getSendOptions } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { TransactionReceipt } from 'web3-core';
import { ContractSendMethod } from 'web3-eth-contract';
import { EMPTY_DATA, ERC20, GEYSER_ABI, MAX, SETT_ABI } from 'config/constants';
import { TokenBalance } from 'mobx/model/token-balance';
import { BadgerSett } from 'mobx/model/badger-sett';
import { BadgerToken } from 'mobx/model/badger-token';
import { Sett } from 'mobx/model';

/**
 * TODO: A clear pattern emerges on these contract interactions.
 * Refactor all methods to accept payload arguments to augment the flow
 * of the underlying web3 calls + notification messages.
 */
class ContractsStore {
	private store!: RootStore;

	constructor(store: RootStore) {
		this.store = store;
	}

	/* Contract Interaction Methods */

	deposit = async (
		sett: Sett,
		badgerSett: BadgerSett,
		userBalance: TokenBalance,
		depositAmount: TokenBalance,
	): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const amount = depositAmount.balance;

		if (amount.isNaN() || amount.lte(0) || amount.gt(userBalance.balance)) {
			queueNotification('Please enter a valid amount', 'error');
			return;
		}

		const allowance = await this.getAllowance(badgerSett.depositToken, badgerSett.vaultToken.address);
		if (amount.gt(allowance.balance)) {
			await this.increaseAllowance(badgerSett.depositToken, badgerSett.vaultToken.address);
		}

		await this.depositVault(sett, depositAmount);
	};

	unstake = async (
		sett: Sett,
		badgerSett: BadgerSett,
		userBalance: TokenBalance,
		unstakeAmount: TokenBalance,
	): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const amount = unstakeAmount.balance;

		if (!badgerSett.geyser) {
			return;
		}

		if (amount.isNaN() || amount.lte(0) || amount.gt(userBalance.balance)) {
			queueNotification('Please enter a valid amount', 'error');
			return;
		}

		await this.unstakeGeyser(sett, badgerSett, unstakeAmount);
	};

	withdraw = async (
		sett: Sett,
		badgerSett: BadgerSett,
		userBalance: TokenBalance,
		withdrawAmount: TokenBalance,
	): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const amount = withdrawAmount.balance;

		// ensure balance is valid
		if (amount.isNaN() || amount.lte(0) || amount.gt(userBalance.balance)) {
			queueNotification('Please enter a valid amount', 'error');
			return;
		}

		await this.withdrawVault(sett, badgerSett, withdrawAmount);
	};

	increaseAllowance = async (token: BadgerToken, contract: string): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
		// provide infinite approval
		const method: ContractSendMethod = underlyingContract.methods.approve(contract, MAX);

		queueNotification(`Sign the transaction to allow Badger to spend your ${token.symbol}`, 'info');

		// TODO: provide some useful look up / gas tooling
		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);

		let completed = false;
		await method
			.send(options)
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('transactionHash', (_hash: string) => {
				// TODO: Hash seems to do nothing - investigate this?
				queueNotification(`Transaction submitted.`, 'info');
			})
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('receipt', (_receipt: TransactionReceipt) => {
				if (!completed) {
					queueNotification(`${token.symbol} allowance increased`, 'success');
					completed = true;
				}
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
			});
	};

	getAllowance = async (token: BadgerToken, spender: string): Promise<TokenBalance> => {
		const { provider, connectedAddress } = this.store.wallet;
		const { rewards } = this.store;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
		const allowance = await underlyingContract.methods.allowance(connectedAddress, spender).call();

		return new TokenBalance(rewards, token, new BigNumber(allowance), new BigNumber(0));
	};

	unstakeGeyser = async (sett: Sett, badgerSett: BadgerSett, amount: TokenBalance): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		if (!badgerSett.geyser) {
			return;
		}

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(GEYSER_ABI, badgerSett.geyser);
		const unstakeBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		const method = geyserContract.methods.unstake(unstakeBalance, EMPTY_DATA);

		const unstakeAmount = `${amount.balanceDisplay()} b${sett.asset}`;
		const unstakeMessage = `Sign the transaction to unstake ${unstakeAmount}`;
		queueNotification(unstakeMessage, 'info');

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);

		let completed = false;
		await method
			.send(options)
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Withdraw submitted.`, 'info');
			})
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('receipt', (_receipt: TransactionReceipt) => {
				if (!completed) {
					queueNotification(`Successfully unstaked ${unstakeAmount}`, 'info');
					completed = true;
				}
				this.store.user.updateBalances();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
			});
	};

	depositVault = async (sett: Sett, amount: TokenBalance, all?: boolean): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress, network } = this.store.wallet;
		const { bouncerProof } = this.store.user;

		const web3 = new Web3(provider);
		const settContract = new web3.eth.Contract(SETT_ABI, sett.vaultToken);
		const depositBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		let method: ContractSendMethod = settContract.methods.deposit(depositBalance);

		// TODO: Clean this up, too many branches
		// Uncapped deposits on a wrapper still require an empty proof
		if (network.uncappedDeposit[sett.vaultToken]) {
			if (all) {
				method = settContract.methods.deposit([]);
			} else {
				method = settContract.methods.deposit(depositBalance, []);
			}
		}
		if (network.cappedDeposit[sett.vaultToken]) {
			if (process.env.REACT_APP_BUILD_ENV !== 'production') {
				console.log('proof:', bouncerProof);
			}
			if (!bouncerProof) {
				queueNotification(`Error loading Badger Bouncer Proof`, 'error');
				return;
			}
			if (all) {
				method = settContract.methods.deposit(bouncerProof);
			} else {
				method = settContract.methods.deposit(depositBalance, bouncerProof);
			}
		} else if (all) {
			method = settContract.methods.depositAll();
		}

		const depositAmount = `${amount.balanceDisplay()} ${sett.asset}`;
		const depositMessage = `Sign the transaction to wrap ${depositAmount}`;
		queueNotification(depositMessage, 'info');

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);

		let completed = false;
		await method
			.send(options)
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Deposit submitted.`, 'info');
			})
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('receipt', (_receipt: TransactionReceipt) => {
				if (!completed) {
					queueNotification(`Successfully deposited ${depositAmount}`, 'info');
					completed = true;
				}
				this.store.user.updateBalances();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
			});
	};

	withdrawVault = async (sett: Sett, badgerSett: BadgerSett, amount: TokenBalance): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(SETT_ABI, badgerSett.vaultToken.address);
		const withdrawBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		const method = underlyingContract.methods.withdraw(withdrawBalance);

		const withdrawAmount = `${amount.balanceDisplay()} b${sett.asset}`;
		const withdrawMessage = `Sign the transaction to unwrap ${withdrawAmount}`;
		queueNotification(withdrawMessage, 'info');

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);

		let completed = false;
		await method
			.send(options)
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Withdraw submitted.`, 'info');
			})
			/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
			.on('receipt', (_receipt: TransactionReceipt) => {
				if (!completed) {
					queueNotification(`Successfully withdrew ${withdrawAmount}`, 'info');
					completed = true;
				}
				this.store.user.updateBalances();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
			});
	};
}

export default ContractsStore;
