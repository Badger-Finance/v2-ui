import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { BatchConfig, TokenContract } from '../model';

export const estimateAndSend = (
	web3: Web3,
	gasPrice: number,
	method: ContractSendMethod,
	address: string,
	// eslint-disable-next-line autofix/no-unused-vars
	callback: (transaction: PromiEvent<Contract>) => void,
): void => {
	const gasWei = new BigNumber(gasPrice.toFixed(0));

	method.estimateGas(
		{
			from: address,
			gas: gasWei.toNumber(),
		},
		(error: any, gasLimit: number) => {
			callback(
				method.send({
					from: address,
					gas: Math.floor(gasLimit * 1.2),
					gasPrice: gasWei.multipliedBy(1e9).toFixed(0),
				}),
			);
		},
	);
};

export const batchConfig = (namespace: string, addresses: any[], methods: any[], abi: AbiItem): BatchConfig => {
	let readMethods = {};
	let abiFile = {};

	if (methods.length > 0)
		readMethods = {
			readMethods: methods,
		};
	if (!!abi)
		abiFile = {
			abi: abi,
		};
	return {
		namespace,
		addresses: addresses.map((address: string) => Web3.utils.toChecksumAddress(address)),
		allReadMethods: false,
		groupByNamespace: true,
		logging: false,
		...readMethods,
		...abiFile,
	};
};

export const erc20Methods = (connectedAddress: string, token: TokenContract): any[] => {
	if (!!connectedAddress && !!token.contract) {
		// get allowance of each vault

		return [
			{
				name: 'balanceOf',
				args: [Web3.utils.toChecksumAddress(connectedAddress)],
			},
			{
				name: 'totalSupply',
			},
			{
				name: 'symbol',
			},
			{
				name: 'allowance',
				args: [Web3.utils.toChecksumAddress(connectedAddress), Web3.utils.toChecksumAddress(token.contract)],
			},
		];
	} else {
		return [];
	}
};
