import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { estimateAndSend } from 'mobx/utils/web3';
import { RootStore } from 'mobx/store';
import EMP from '../../../config/system/abis/ExpiringMultiParty.json';
import BigNumber from 'bignumber.js';
import { ERC20 } from 'config/constants';

export class EmpAction {
	constructor(private store: RootStore, private empAddress: string) {
		this.store = store;
		this.empAddress = empAddress;
	}

	get methods() {
		const web3 = new Web3(this.store.wallet.provider);
		const emp = new web3.eth.Contract(EMP.abi as AbiItem[], this.empAddress);
		return emp.methods;
	}

	async approveSpendingIfRequired(tokenAddress: string, amount: string) {
		const { queueNotification } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;
		const web3 = new Web3(provider);

		const token = new web3.eth.Contract(ERC20.abi as AbiItem[], tokenAddress);
		const approveSpend = token.methods.approve(this.empAddress, amount.toString());
		const currentAllowance: string = await token.methods.allowance(connectedAddress, this.empAddress).call();
		const isApprovalNeeded = new BigNumber(currentAllowance).lt(amount);

		if (!isApprovalNeeded) return;

		queueNotification(`First, we need you to approve your collateral spending`, 'info');

		return new Promise<void>((onSuccess, onError) => {
			estimateAndSend(
				web3,
				this.store.wallet.gasPrices[this.store.uiState.gasPrice],
				approveSpend,
				connectedAddress,
				(transaction: PromiEvent<Contract>, error?: Error) => {
					if (error) {
						queueNotification(error.message || 'There was an error estimating gas', 'error');
					}
					transaction
						.on('transactionHash', (hash) => {
							queueNotification(`Transaction submitted.`, 'info', hash);
						})
						.on('receipt', () => {
							queueNotification(`Spending approved`, 'success');
							onSuccess();
						})
						.catch((error: any) => {
							onError(error);
						});
				},
			);
		});
	}

	/**
	 * All EMP transactions follow the same logical structure so we use this method to execute them
	 * @param method function of the contract that's going to be used
	 * @param informationMessage optional information message
	 * @param successMessage optional success message
	 * @returns EMP transaction promise
	 */
	execute(method: any, informationMessage?: string, successMessage?: string) {
		const { provider, connectedAddress } = this.store.wallet;
		const { queueNotification } = this.store.uiState;
		const web3 = new Web3(provider);

		informationMessage && queueNotification(informationMessage, 'info');

		return new Promise<void>((onSuccess, onError) => {
			estimateAndSend(
				web3,
				this.store.wallet.gasPrices[this.store.uiState.gasPrice],
				method,
				connectedAddress,
				(transaction: PromiEvent<Contract>, error?: Error) => {
					if (error) {
						queueNotification(error.message || 'There was an error estimating gas', 'error');
					}
					transaction
						.on('transactionHash', (hash) => {
							queueNotification(`Transaction submitted.`, 'info', hash);
						})
						.on('receipt', () => {
							queueNotification(successMessage || 'Success', 'success');
							onSuccess();
						})
						.catch((error: any) => {
							onError(error);
						});
				},
			);
		});
	}
}
