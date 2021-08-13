import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { getSendOptions } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../RootStore';
import { ContractSendMethod, SendOptions } from 'web3-eth-contract';
import { EMPTY_DATA, ERC20, GEYSER_ABI, MAX, SETT_ABI, YEARN_ABI } from 'config/constants';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { BadgerToken } from 'mobx/model/tokens/badger-token';
import { toFixedDecimals, unscale } from '../utils/helpers';
import { action, extendObservable } from 'mobx';
import { Sett } from '../model/setts/sett';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';

type ProgressTracker = Record<string, boolean>;

class ContractsStore {
	private store!: RootStore;
	public settsBeingDeposited: ProgressTracker = {};
	public settsBeingUnstaked: ProgressTracker = {};
	public settsBeingWithdrawn: ProgressTracker = {};

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			settsBeingDeposited: this.settsBeingDeposited,
			settsBeingUnstaked: this.settsBeingUnstaked,
			settsBeingWithdrawn: this.settsBeingWithdrawn,
		});
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
		const options = await this._getSendOptions(method);
		const infoMessage = 'Transaction submitted';
		const successMessage = `${token.symbol} allowance increased`;

		queueNotification(`Sign the transaction to allow Badger to spend your ${token.symbol}`, 'info');

		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(infoMessage, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(successMessage, 'info');
			});
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
		const { queueNotification } = this.store.uiState;

		if (!badgerSett.geyser) {
			return;
		}

		const web3 = new Web3(provider);
		const geyserContract = new web3.eth.Contract(GEYSER_ABI, badgerSett.geyser);
		const unstakeBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		const method = geyserContract.methods.unstake(unstakeBalance, EMPTY_DATA);
		const options = await this._getSendOptions(method);

		const { tokenBalance, token } = amount;
		const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		const unstakeAmount = `${displayAmount} b${sett.asset}`;

		queueNotification(`Sign the transaction to unstake ${unstakeAmount}`, 'info');

		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification('Unstake transaction submitted', 'info', _hash);
				this.settsBeingUnstaked[sett.vaultToken] = true;
			})
			.on('receipt', () => {
				queueNotification(`Successfully unstaked ${unstakeAmount}`, 'info');
				this.settsBeingUnstaked[sett.vaultToken] = false;
				this.store.user.updateBalances();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
				this.settsBeingUnstaked[sett.vaultToken] = false;
			});
	};

	depositVault = action(
		async (sett: Sett, amount: TokenBalance, depositAll?: boolean): Promise<void> => {
			const { queueNotification } = this.store.uiState;
			const { provider } = this.store.wallet;
			const { bouncerProof } = this.store.user;

			const web3 = new Web3(provider);
			const settContract = new web3.eth.Contract(SETT_ABI, sett.vaultToken);
			const yearnContract = new web3.eth.Contract(YEARN_ABI, sett.vaultToken);
			const depositBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
			let method: ContractSendMethod = settContract.methods.deposit(depositBalance);

			// TODO: Clean this up, too many branches
			// Uncapped deposits on a wrapper still require an empty proof
			// TODO: better designate abi <> sett pairing, single yearn vault uses yearn ABI.
			if (sett.vaultToken === Web3.utils.toChecksumAddress(ETH_DEPLOY.sett_system.vaults['yearn.wBtc'])) {
				if (depositAll) {
					method = yearnContract.methods.deposit([]);
				} else {
					method = yearnContract.methods.deposit(depositBalance, []);
				}
			}

			if (sett.hasBouncer) {
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

			const options = await this._getSendOptions(method);
			const { tokenBalance, token } = amount;
			const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
			const depositAmount = `${displayAmount} ${sett.asset}`;

			queueNotification(`Sign the transaction to wrap ${depositAmount}`, 'info');

			await method
				.send(options)
				.on('transactionHash', (_hash: string) => {
					this.settsBeingDeposited[sett.vaultToken] = true;
					queueNotification('Deposing transaction submitted', 'info', _hash);
				})
				.on('receipt', () => {
					queueNotification(`Successfully deposited ${depositAmount}`, 'info');
					this.settsBeingDeposited[sett.vaultToken] = false;
					this.store.user.updateBalances();
				})
				.on('error', (error: Error) => {
					queueNotification(error.message, 'error');
					this.settsBeingDeposited[sett.vaultToken] = false;
				});
		},
	);

	withdrawVault = action(
		async (sett: Sett, badgerSett: BadgerSett, amount: TokenBalance): Promise<void> => {
			const { provider } = this.store.wallet;
			const { queueNotification } = this.store.uiState;

			const web3 = new Web3(provider);
			const underlyingContract = new web3.eth.Contract(SETT_ABI, badgerSett.vaultToken.address);
			const withdrawBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
			const method = underlyingContract.methods.withdraw(withdrawBalance);
			const options = await this._getSendOptions(method);

			const { tokenBalance, token } = amount;
			const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
			const withdrawAmount = `${displayAmount} b${sett.asset}`;

			queueNotification(`Sign the transaction to unwrap ${withdrawAmount}`, 'info');

			await method
				.send(options)
				.on('transactionHash', (_hash: string) => {
					queueNotification('Withdraw transaction submitted', 'info', _hash);
					this.settsBeingWithdrawn[sett.vaultToken] = true;
				})
				.on('receipt', () => {
					queueNotification(`Successfully withdrew ${withdrawAmount}`, 'info');
					this.settsBeingWithdrawn[sett.vaultToken] = false;
					this.store.user.updateBalances();
				})
				.on('error', (error: Error) => {
					queueNotification(error.message, 'error');
					this.settsBeingWithdrawn[sett.vaultToken] = false;
				});
		},
	);

	private _getSendOptions = async (method: ContractSendMethod): Promise<SendOptions> => {
		const { connectedAddress } = this.store.wallet;

		const gasPrice = this.store.network.gasPrices[this.store.uiState.gasPrice];
		return await getSendOptions(method, connectedAddress, gasPrice);
	};
}

export default ContractsStore;
