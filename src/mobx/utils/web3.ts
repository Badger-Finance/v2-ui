import { GasFees } from '@badger-dao/sdk';
import BigNumber from 'bignumber.js';
import { DEBUG } from 'config/environment';
import { RootStore } from 'mobx/RootStore';
import { ContractSendMethod, EstimateGasOptions, SendOptions } from 'web3-eth-contract';

export interface EIP1559SendOptions {
	from: string;
	gas: number;
	maxFeePerGas: string;
	maxPriorityFeePerGas: string;
	legacyGas: string;
}

export const getSendOptions = async (
	// We use "any" for method as web3.js does not have a general contract method interface
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	method: any,
	connectedAddress: string,
	price: number | GasFees,
): Promise<SendOptions | EIP1559SendOptions> => {
	return typeof price === 'number'
		? await getNonEIP1559SendOptions(method, connectedAddress, price)
		: await getEIP1559SendOptions(method, connectedAddress, price);
};

export const getNonEIP1559SendOptions = async (
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
	price: GasFees,
): Promise<EIP1559SendOptions> => {
	const { maxFeePerGas, maxPriorityFeePerGas } = price;
	const maxFeePerGasWei = new BigNumber(maxFeePerGas.toFixed(0)).multipliedBy(1e9);
	const maxPriorityFeePerGasWei = new BigNumber(maxPriorityFeePerGas.toFixed(0)).multipliedBy(1e9);
	const options: EstimateGasOptions = {
		from,
		gas: maxFeePerGasWei.toNumber(),
	};
	const limit = await method.estimateGas(options);
	const legacyGas = maxFeePerGasWei.div(2).minus(maxPriorityFeePerGasWei);
	return {
		from,
		gas: Math.floor(limit * 1.2),
		maxFeePerGas: maxFeePerGasWei.toFixed(0),
		maxPriorityFeePerGas: maxPriorityFeePerGasWei.toFixed(0),
		legacyGas: legacyGas.toFixed(0),
	};
};

// Check type of options via type guards: https://www.typescriptlang.org/docs/handbook/advanced-types.html
const _isEIP1559SendOption = (options: any): options is EIP1559SendOptions => {
	return 'maxFeePerGas' in options;
};

export enum TransactionRequestResult {
	Success = 'success',
	Failure = 'failure',
	Rejected = 'rejected',
}

export async function sendContractMethod(
	store: RootStore,
	// Methods do not have types in web3.js - allow for any typing here
	/* eslint-disable  @typescript-eslint/explicit-module-boundary-types */
	method: any,
	options: SendOptions | EIP1559SendOptions,
	txHashMessage: string,
	receiptMessage: string,
	errorMessage?: string,
	reloadBalances = true,
): Promise<TransactionRequestResult> {
	const queueNotification = store.uiState.queueNotification;
	try {
		let result = TransactionRequestResult.Success;
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(txHashMessage, 'info', _hash);
			})
			.on('receipt', async () => {
				queueNotification(receiptMessage, 'success');
				if (reloadBalances) {
					await store.user.reloadBalances();
				}
			})
			.on('error', async (error: any) => {
				// code -32602 means that the params for an EIP1559 transaction were invalid.
				// Retry the transaction with legacy options.
				if (error.code === -32602 && _isEIP1559SendOption(options)) {
					const newOptions = { from: options.from, gas: options.gas, gasPrice: options.legacyGas };
					result = await sendContractMethod(
						store,
						method,
						newOptions,
						txHashMessage,
						receiptMessage,
						errorMessage,
					);
					return;
				}
				// use canceled the transaction request
				if (error.code === 4001) {
					result = TransactionRequestResult.Rejected;
					return;
				}
				result = TransactionRequestResult.Failure;
				const message = errorMessage ?? error.message;
				console.error(message);
				queueNotification(message, 'error');
			});
		return result;
	} catch (err) {
		// use canceled the transaction request
		if (err.code === 4001) {
			return TransactionRequestResult.Rejected;
		}
		console.error(err);
		if (DEBUG) {
			queueNotification(errorMessage ? errorMessage : err.message, 'error');
		}
		return TransactionRequestResult.Failure;
	}
}
