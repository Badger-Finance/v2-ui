import { BatchConfig, BscNetwork, DeployConfig, EthNetwork, Network, TokenContract } from '../model';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
import { NETWORK_IDS, NETWORK_LIST } from '../../config/constants';

import { AbiItem } from 'web3-utils';
import BigNumber from 'bignumber.js';
import { PromiEvent } from 'web3-core';
import Web3 from 'web3';
import bscDeploy from '../../config/deployments/bsc.json';
import deploy from '../../config/deployments/mainnet.json';

export const getNetwork = (network?: string): Network => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return new BscNetwork();
		case NETWORK_LIST.ETH:
			return new EthNetwork();
		default:
			return new EthNetwork();
	}
};

export const getNetworkId = (network?: string): number => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return 56;
		// case NETWORK_LIST.XDAI:
		// 	return 100;
		// case NETWORK_LIST.FTM:
		// 	return 250;
		// case NETWORK_LIST.MATIC:
		// 	return 137;
		default:
			return 1;
	}
};

export const getNetworkNameFromId = (network: number): string | undefined => {
	switch (network) {
		case NETWORK_IDS.BSC:
			return NETWORK_LIST.BSC;
		case NETWORK_IDS.ETH:
			return NETWORK_LIST.ETH;
		default:
			return undefined;
	}
};

export const getNetworkDeploy = (network?: string | undefined): DeployConfig | undefined => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return bscDeploy;
		case NETWORK_LIST.ETH:
			return deploy;
		default:
			return undefined;
	}
};

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
