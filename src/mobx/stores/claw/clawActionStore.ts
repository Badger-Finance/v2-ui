import { action } from 'mobx';
import ClawStore from './clawStore';
import { EmpAction } from './empAction';

export class ClawActionStore {
	mainStore: ClawStore;

	constructor(store: ClawStore) {
		this.mainStore = store;
	}

	mint = action(async (empAddress: string, collateralAmount: string, mintAmount: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const synthetic = this.mainStore.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			const action = new EmpAction(this.mainStore.store, empAddress);
			const method = action.methods.create({ rawValue: collateralAmount }, { rawValue: mintAmount });
			await action.approveSpendingIfRequired(synthetic.collateralCurrency, collateralAmount);
			await action.execute(method, 'Please sign Mint transaction', 'Mint Success');
		} catch (error) {
			queueNotification(error?.message || 'There was an error minting', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	redeem = action(async (empAddress: string, numTokens: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const synthetic = this.mainStore.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			const action = new EmpAction(this.mainStore.store, empAddress);
			const redeem = action.methods.redeem({ rawValue: numTokens });
			await action.approveSpendingIfRequired(synthetic.tokenCurrency, numTokens);
			await action.execute(redeem, 'Please sign redeem transaction', 'Redeem success');
			await this.mainStore.updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error redeeming collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	settleExpired = action(async (empAddress: string, numTokens: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const synthetic = this.mainStore.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			const action = new EmpAction(this.mainStore.store, empAddress);
			const redeem = action.methods.settleExpired();
			await action.approveSpendingIfRequired(synthetic.tokenCurrency, numTokens);
			await action.execute(redeem, 'Please sign settle expire transaction', 'Redeem success');
			await this.mainStore.updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error redeeming collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	withdraw = action(async (empAddress: string, collateralAmount: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const action = new EmpAction(this.mainStore.store, empAddress);
			const withdraw = action.methods.requestWithdrawal({ rawValue: collateralAmount });
			await action.execute(withdraw, 'Please sign withdraw transaction', 'Withdraw success');
			await this.mainStore.updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error withdrawing collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	withdrawPassedRequest = action(async (empAddress: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const action = new EmpAction(this.mainStore.store, empAddress);
			const withdraw = action.methods.withdrawPassedRequest();
			await action.execute(withdraw, 'Please sign withdraw passed request transaction', 'Withdraw success');
			await this.mainStore.updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'Please sign withdraw passed request transaction', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	cancelWithdrawal = action(async (empAddress: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const action = new EmpAction(this.mainStore.store, empAddress);
			const cancelWithdrawal = action.methods.cancelWithdrawal();
			await action.execute(
				cancelWithdrawal,
				'Please sign cancel withdrawal request transaction',
				'Cancel withdrawal success',
			);
			await this.mainStore.updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error cancelling withdrawal', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});

	deposit = action(async (empAddress: string, depositAmount: string) => {
		const { queueNotification } = this.mainStore.store.uiState;
		try {
			const synthetic = this.mainStore.syntheticsDataByEMP.get(empAddress);
			if (!synthetic) return;

			const action = new EmpAction(this.mainStore.store, empAddress);
			const deposit = action.methods.deposit({ rawValue: depositAmount });
			await action.approveSpendingIfRequired(synthetic.collateralCurrency, depositAmount);
			await action.execute(action, 'Please sign deposit transaction', 'Deposit success');
			await this.mainStore.updateBalances();
		} catch (error) {
			queueNotification(error?.message || 'There was an error depositing collateral', 'error');
			process.env.NODE_ENV !== 'production' && console.log(error);
		}
	});
}

export default ClawStore;
