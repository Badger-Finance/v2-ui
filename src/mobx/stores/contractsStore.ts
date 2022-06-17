import { BouncerType, Token, VaultDTO } from '@badger-dao/sdk';
import { MAX } from 'config/constants';
import { action, extendObservable } from 'mobx';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerVault } from 'mobx/model/vaults/badger-vault';

import { RootStore } from '../RootStore';

// TODO: did we lose some functionality here?
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
		vault: VaultDTO,
		badgerVault: BadgerVault,
		userBalance: TokenBalance,
		depositAmount: TokenBalance,
	): Promise<void> => {};

	withdraw = async (
		vault: VaultDTO,
		badgerVault: BadgerVault,
		userBalance: TokenBalance,
		withdrawAmount: TokenBalance,
	): Promise<void> => {};

	increaseAllowance = async (token: Token, contract: string) => {
		const {
			wallet: { web3Instance },
			uiState: { queueNotification },
		} = this.store;
	};

	depositVault = action(async (vault: VaultDTO, amount: TokenBalance, depositAll?: boolean): Promise<void> => {
		const { queueNotification } = this.store.uiState;
		const { bouncerProof } = this.store.user;
		const { web3Instance } = this.store.wallet;

		// if (!web3Instance) return;
		// const settContract = new web3Instance.eth.Contract(SETT_ABI, vault.vaultToken);
		// const yearnContract = new web3Instance.eth.Contract(YEARN_ABI, vault.vaultToken);
		// const depositBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		// let method: ContractSendMethod = settContract.methods.deposit(depositBalance);

		// // TODO: Clean this up, too many branches
		// // Uncapped deposits on a wrapper still require an empty proof
		// // TODO: better designate abi <> sett pairing, single yearn vault uses yearn ABI.
		// if (vault.vaultToken === Web3.utils.toChecksumAddress(ETH_DEPLOY.sett_system.vaults['yearn.wBtc'])) {
		// 	if (depositAll) {
		// 		method = yearnContract.methods.deposit([]);
		// 	} else {
		// 		method = yearnContract.methods.deposit(depositBalance, []);
		// 	}
		// }

		// if (vault.bouncer === BouncerType.Badger) {
		// 	if (!bouncerProof) {
		// 		queueNotification(`Error loading Badger Bouncer Proof`, 'error');
		// 		return;
		// 	}
		// 	if (depositAll) {
		// 		method = settContract.methods.deposit(bouncerProof);
		// 	} else {
		// 		method = settContract.methods.deposit(depositBalance, bouncerProof);
		// 	}
		// } else if (depositAll) {
		// 	method = settContract.methods.depositAll();
		// }

		// const options = await this.getMethodSendOptions(method);
		// const { tokenBalance, token } = amount;
		// const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		// const depositAmount = `${displayAmount} ${vault.asset}`;

		// queueNotification(`Sign the transaction to deposit ${depositAmount}`, 'info');
		// await sendContractMethod(
		// 	this.store,
		// 	method,
		// 	options,
		// 	'Deposing transaction submitted',
		// 	`Successfully deposited ${depositAmount}`,
		// );
	});

	withdrawVault = action(async (vault: VaultDTO, badgerVault: BadgerVault, amount: TokenBalance): Promise<void> => {
		const { web3Instance } = this.store.wallet;
		const { queueNotification } = this.store.uiState;

		// if (!web3Instance) return;
		// const underlyingContract = new web3Instance.eth.Contract(SETT_ABI, badgerVault.vaultToken.address);
		// const withdrawBalance = amount.tokenBalance.toFixed(0, BigNumber.ROUND_HALF_FLOOR);
		// const method = underlyingContract.methods.withdraw(withdrawBalance);
		// const options = await this.getMethodSendOptions(method);

		// const { tokenBalance, token } = amount;
		// const displayAmount = toFixedDecimals(unscale(tokenBalance, token.decimals), token.decimals);
		// const withdrawAmount = `${displayAmount} b${vault.asset}`;

		// queueNotification(`Sign the transaction to withdraw ${withdrawAmount}`, 'info');
		// await sendContractMethod(
		// 	this.store,
		// 	method,
		// 	options,
		// 	'Withdraw transaction submitted',
		// 	`Successfully withdrew ${withdrawAmount}`,
		// );
	});
}

export default ContractsStore;
