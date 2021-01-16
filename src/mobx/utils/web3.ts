import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import WalletStore from '../stores/walletStore';
import _ from 'lodash';

const {} = require('../../config/constants');

export const estimateAndSend = (
	web3: Web3,
	gasPrice: number,
	method: ContractSendMethod,
	address: string,
	callback: (transaction: PromiEvent<Contract>) => void,
) => {
	const gasWei = new BigNumber(gasPrice.toFixed(0));

	method.estimateGas(
		{
			from: address,
			gas: gasWei.toNumber(),
		},
		(error: any, gasLimit: number) => {
			callback(method.send({ from: address, gas: gasLimit, gasPrice: gasWei.multipliedBy(1e9).toFixed(0) }));
		},
	);
};

export const batchConfig = (namespace: string, addresses: any[], methods: any[], abi: any, allReadMethods = true) => {
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
		allReadMethods,
		groupByNamespace: true,
		logging: false,
		...readMethods,
		...abiFile,
	};
};

export const getTokenAddresses = (contracts: any, config: any) => {
	// pull underlying and yileding token addresses
	const addresses: any[] = [];
	_.map(contracts, (contract: any) => {
		if (!!contract[config.underlying!])
			addresses.push({
				address: contract[config.underlying!],
				contract: contract.address.toLowerCase(),
				type: 'underlying',
				subgraph:
					!!config.sushi && config.sushi.includes(contract.address)
						? 'zippoxer/sushiswap-subgraph-fork'
						: 'uniswap/uniswap-v2',
			});
		// if (!!contract[config.yielding!])
		// 	addresses.push({ address: contract[config.yielding!], contract: contract.address.toLowerCase(), type: 'yielding' })
	});
	return addresses;
};

export const contractMethods = (config: any, wallet: WalletStore): any[] => {
	let methods = [];
	if (!!config.rewards) {
		methods.push({
			name: config.rewards.method,
			args: config.rewards.tokens,
		});
	}

	if (!!wallet.connectedAddress)
		methods = methods.concat(
			config.walletMethods.map((method: string) => {
				return {
					name: method,
					args: [wallet.connectedAddress],
				};
			}),
		);

	return methods;
};
export const erc20Methods = (connectedAddress: string, token: any): any[] => {
	if (!!connectedAddress && !!token.contract) {
		// get allowance of each vault

		return [
			{
				name: 'balanceOf',
				args: [Web3.utils.toChecksumAddress(connectedAddress)],
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
