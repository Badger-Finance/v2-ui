import { AbiItem } from 'web3-utils';
import { sendContractMethod } from '../utils/web3';
import { RootStore } from '../RootStore';
import { ContractSendMethod } from 'web3-eth-contract';
import { EMPTY_DATA, ERC20, GEYSER_ABI, MAX, SETT_ABI, YEARN_ABI } from 'config/constants';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { BadgerToken } from 'mobx/model/tokens/badger-token';
import { unscale } from '../utils/helpers';
import { action, extendObservable } from 'mobx';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { BouncerType, Sett } from '@badger-dao/sdk';
import { ethers } from 'ethers';

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

		if (amount.lte(0) || amount.gt(userBalance.balance)) {
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

		if (amount.lte(0) || amount.gt(userBalance.balance)) {
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
		if (amount.lte(0) || amount.gt(userBalance.balance)) {
			queueNotification('Please enter a valid amount', 'error');
			return;
		}

		await this.withdrawVault(sett, badgerSett, withdrawAmount);
	};

	increaseAllowance = async (token: BadgerToken, contract: string): Promise<void> => {
		const {
			wallet: { provider },
			uiState: { queueNotification },
		} = this.store;

		const web3 = new Web3(provider);
		const underlyingContract = new web3.eth.Contract(ERC20.abi as AbiItem[], token.address);
		// provide infinite approval
		const method: ContractSendMethod = underlyingContract.methods.approve(contract, MAX);
		const options = await this.store.wallet.getMethodSendOptions(method);
		const infoMessage = 'Transaction submitted';
		const successMessage = `${token.symbol} allowance increased`;

		queueNotification(`Sign the transaction to allow Badger to spend your ${token.symbol}`, 'info');
		await sendContractMethod(this.store, method, options, infoMessage, successMessage);
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
		const options = await this.store.wallet.getMethodSendOptions(method);

		const { tokenBalance, token } = amount;
		const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		const unstakeAmount = `${displayAmount} b${sett.asset}`;

		queueNotification(`Sign the transaction to unstake ${unstakeAmount}`, 'info');
		await sendContractMethod(
			this.store,
			method,
			options,
			'Unstake transaction submitted',
			`Successfully unstaked ${unstakeAmount}`,
		);
	};

	depositVault = action(
		async (sett: Sett, amount: TokenBalance, depositAll?: boolean): Promise<void> => {
			const { queueNotification } = this.store.uiState;
			const { provider } = this.store.wallet;
			const { bouncerProof } = this.store.user;

			const web3 = new Web3(provider);
			const settContract = new web3.eth.Contract(SETT_ABI, sett.settToken);
			const yearnContract = new web3.eth.Contract(YEARN_ABI, sett.settToken);
			const depositBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
			let method: ContractSendMethod = settContract.methods.deposit(depositBalance);

			// TODO: Clean this up, too many branches
			// Uncapped deposits on a wrapper still require an empty proof
			// TODO: better designate abi <> sett pairing, single yearn vault uses yearn ABI.
			if (sett.settToken === ethers.utils.getAddress(ETH_DEPLOY.sett_system.vaults['yearn.wBtc'])) {
				if (depositAll) {
					method = yearnContract.methods.deposit([]);
				} else {
					method = yearnContract.methods.deposit(depositBalance, []);
				}
			}

			if (sett.bouncer === BouncerType.Badger) {
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

			const options = await this.store.wallet.getMethodSendOptions(method);
			const { tokenBalance, token } = amount;
			const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
			const depositAmount = `${displayAmount} ${sett.asset}`;

			queueNotification(`Sign the transaction to wrap ${depositAmount}`, 'info');
			await sendContractMethod(
				this.store,
				method,
				options,
				'Deposing transaction submitted',
				`Successfully deposited ${depositAmount}`,
			);
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
			const options = await this.store.wallet.getMethodSendOptions(method);

			const { tokenBalance, token } = amount;
			const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
			const withdrawAmount = `${displayAmount} b${sett.asset}`;

			queueNotification(`Sign the transaction to unwrap ${withdrawAmount}`, 'info');
			await sendContractMethod(
				this.store,
				method,
				options,
				'Withdraw transaction submitted',
				`Successfully withdrew ${withdrawAmount}`,
			);
		},
	);
}

export default ContractsStore;
