import BigNumber from 'bignumber.js';
import { RootStore } from 'mobx/RootStore';
import { ContractSendMethod, EstimateGasOptions, SendOptions } from 'web3-eth-contract';

export interface EIP1559SendOptions {
	from: string;
	gas: number;
	maxFeePerGas: string;
	maxPriorityFeePerGas: string;
}

export const getSendOptions = async (
	method: ContractSendMethod,
	from: string,
	gasPrice: number,
): Promise<SendOptions> => {
	const gasWei = new BigNumber(gasPrice.toFixed(0)).multipliedBy(1e9);
	const options: EstimateGasOptions = {
		from,
		gas: gasWei.toNumber(),
	};
	const limit = await method.estimateGas(options);
	return {
		from,
		gas: Math.floor(limit * 1.2),
		gasPrice: gasWei.toFixed(0),
	};
};

export const getEIP1559SendOptions = async (
	method: ContractSendMethod,
	from: string,
	maxFeePerGas: number,
	maxPriorityFeePerGas: number,
): Promise<EIP1559SendOptions> => {
	const maxFeePerGasWei = new BigNumber(maxFeePerGas.toFixed(0)).multipliedBy(1e9);
	const maxPriorityFeePerGasWei = new BigNumber(maxPriorityFeePerGas.toFixed(0)).multipliedBy(1e9);

	const options: EstimateGasOptions = {
		from,
		gas: maxFeePerGasWei.toNumber(),
	};
	const limit = await method.estimateGas(options);

	return {
		from,
		gas: Math.floor(limit * 1.2),
		maxFeePerGas: maxFeePerGasWei.toFixed(0),
		maxPriorityFeePerGas: maxPriorityFeePerGasWei.toFixed(0),
	};
};

// Check type of options via type guards: https://www.typescriptlang.org/docs/handbook/advanced-types.html
const _isEIP1559SendOption = (options: any): options is EIP1559SendOptions => {
	return 'maxFeePerGas' in options;
};

export const sendContractMethod = async (
	store: RootStore,
	// Methods do not have types in web3.js - allow for any typing here
	/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
	method: any,
	options: SendOptions | EIP1559SendOptions,
	txHashMessage: string,
	receiptMessage: string,
	errorMessage?: string,
): Promise<void> => {
	const queueNotification = store.uiState.queueNotification;
	await method
		.send(options)
		.on('transactionHash', (_hash: string) => {
			queueNotification(txHashMessage, 'info', _hash);
		})
		.on('receipt', () => {
			queueNotification(receiptMessage, 'success');
			store.user.updateBalances();
		})
		.on('error', async (error: any) => {
			// code -32602 means that the params for an EIP1559 transaction were invalid.  Retry with legacy
			// options.
			if (error.code === -32602 && _isEIP1559SendOption(options)) {
				const newOptions = { from: options.from, gas: options.gas, gasPrice: options.maxFeePerGas };
				queueNotification('EIP1559 not currently supported for Ledger or this network', 'warning');
				await method
					.send(newOptions)
					.on('transactionHash', (_hash: string) => {
						queueNotification(txHashMessage, 'info', _hash);
					})
					.on('receipt', () => {
						queueNotification(receiptMessage, 'success');
						store.user.updateBalances();
					})
					.on('error', (error: Error) => {
						queueNotification(errorMessage ? errorMessage : error.message, 'error');
					});
			} else {
				queueNotification(errorMessage ? errorMessage : error.message, 'error');
			}
		});
};
