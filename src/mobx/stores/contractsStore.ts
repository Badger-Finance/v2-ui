import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { getSendOptions } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { ContractSendMethod } from 'web3-eth-contract';
import { EMPTY_DATA, ERC20, GEYSER_ABI, MAX, SETT_ABI, YEARN_ABI } from 'config/constants';
import { TokenBalance } from 'mobx/model/token-balance';
import { BadgerSett } from 'mobx/model/badger-sett';
import { BadgerToken } from 'mobx/model/badger-token';
import { Sett } from 'mobx/model';
import { toFixedDecimals, unscale } from '../utils/helpers';

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
			const depositToken: BadgerToken = {
				...badgerSett.depositToken,
				symbol: badgerSett.depositToken.symbol || sett.asset, //fallback symbol
			};
			await this.increaseAllowance(depositToken, badgerSett.vaultToken.address);
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
		const { provider } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
		// provide infinite approval
		const method: ContractSendMethod = underlyingContract.methods.approve(contract, MAX);

		queueNotification(`Sign the transaction to allow Badger to spend your ${token.symbol}`, 'info');

		await this.executeMethod(
			method,
			`Sign the transaction to allow Badger to spend your ${token.symbol}`,
			`${token.symbol} allowance increased`,
		);
	};

	getAllowance = async (token: BadgerToken, spender: string): Promise<TokenBalance> => {
		const { provider, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
		const allowance = await underlyingContract.methods.allowance(connectedAddress, spender).call();

		return new TokenBalance(token, new BigNumber(allowance), new BigNumber(0));
	};

	unstakeGeyser = async (sett: Sett, badgerSett: BadgerSett, amount: TokenBalance): Promise<void> => {
		const { provider } = this.store.wallet;

		if (!badgerSett.geyser) {
			return;
		}

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(GEYSER_ABI, badgerSett.geyser);
		const unstakeBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		const method = geyserContract.methods.unstake(unstakeBalance, EMPTY_DATA);

		const { tokenBalance, token } = amount;
		const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		const unstakeAmount = `${displayAmount} b${sett.asset}`;
		const unstakeMessage = `Sign the transaction to unstake ${unstakeAmount}`;

		await this.executeMethod(method, unstakeMessage, `Successfully unstaked ${unstakeAmount}`);
	};

	depositVault = async (sett: Sett, amount: TokenBalance, depositAll?: boolean): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const { provider, network } = this.store.wallet;
		const { bouncerProof } = this.store.user;

		const web3 = new Web3(provider);
		const settContract = new web3.eth.Contract(SETT_ABI, sett.vaultToken);
		const yearnContract = new web3.eth.Contract(YEARN_ABI, sett.vaultToken);
		const depositBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		let method: ContractSendMethod = settContract.methods.deposit(depositBalance);

		// TODO: Clean this up, too many branches
		// Uncapped deposits on a wrapper still require an empty proof
		if (network.uncappedDeposit[sett.vaultToken]) {
			if (depositAll) {
				method = yearnContract.methods.deposit([]);
			} else {
				method = yearnContract.methods.deposit(depositBalance, []);
			}
		}

		if (network.cappedDeposit[sett.vaultToken]) {
			if (!bouncerProof) {
				queueNotification(`Error loading Badger Bouncer Proof`, 'error');
				return;
			}

			if (depositAll) {
				method = settContract.methods.deposit(bouncerProof);
			} else {
				method = settContract.methods.deposit(depositBalance, bouncerProof);
			}
		} else if (depositAll) {
			method = settContract.methods.depositAll();
		}

		const { tokenBalance, token } = amount;
		const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		const depositAmount = `${displayAmount} ${sett.asset}`;
		const depositMessage = `Sign the transaction to wrap ${depositAmount}`;

		await this.executeMethod(method, depositMessage, `Successfully deposited ${depositAmount}`);
	};

	withdrawVault = async (sett: Sett, badgerSett: BadgerSett, amount: TokenBalance): Promise<void> => {
		const { provider } = this.store.wallet;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(SETT_ABI, badgerSett.vaultToken.address);
		const withdrawBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		const method = underlyingContract.methods.withdraw(withdrawBalance);

		const { tokenBalance, token } = amount;
		const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		const withdrawAmount = `${displayAmount} b${sett.asset}`;
		const withdrawMessage = `Sign the transaction to unwrap ${withdrawAmount}`;

		await this.executeMethod(method, withdrawMessage, `Successfully withdrew ${withdrawAmount}`);
	};

	private async executeMethod(method: ContractSendMethod, infoMessage: string, successMessage: string) {
		const { queueNotification } = this.store.uiState;
		const { connectedAddress } = this.store.wallet;

		const gasPrice = this.store.wallet.gasPrices[this.store.uiState.gasPrice];
		const options = await getSendOptions(method, connectedAddress, gasPrice);

		let completed = false;
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(infoMessage, 'info', _hash);
			})
			.on('receipt', () => {
				if (!completed) {
					queueNotification(successMessage, 'info');
					completed = true;
				}
				this.store.user.updateBalances();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
			});
	}
}

export default ContractsStore;
