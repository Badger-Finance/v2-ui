import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { Contract, ContractSendMethod } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import WalletStore from '../stores/walletStore';
import _ from 'lodash';
import { AbiItem } from 'web3-utils';
import {
	BatchConfig,
	TokenContract,
	ContractMethodsConfig,
	TokenAddressessConfig,
	TokenAddressess,
	DeployConfig,
} from '../model';
import { NETWORK_LIST } from '../../config/constants';
import deploy from '../../config/deployments/mainnet.json';
import bscDeploy from '../../config/deployments/bsc.json';

export const getNetworkName = () => {
	const host = window.location.host;
	const currentNetwork = host.split('.');
	// Enable testing for different networks in development.
	if (currentNetwork.length > 0) {
		if (process.env.NODE_ENV === 'production') {
			return currentNetwork[0];
		} else {
			return NETWORK_LIST.ETH;
		}
	} else {
		return null;
	}
};

export const getNetworkId = (network: string | null) => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return 56;
		case NETWORK_LIST.XDAI:
			return 100;
		case NETWORK_LIST.FTM:
			return 250;
		case NETWORK_LIST.MATIC:
			return 137;
		default:
			return 1;
	}
};

export const getNetworkDeploy = (network: string | null): DeployConfig => {
	switch (network) {
		case NETWORK_LIST.BSC:
			return bscDeploy;
		default:
			return deploy;
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

export const getTokenAddresses = (contracts: any[], config: TokenAddressessConfig): TokenAddressess[] => {
	// pull underlying and yileding token addresses
	const addresses: TokenAddressess[] = [];
	_.map(contracts, (contract: any) => {
		if (!!contract[config.underlying])
			addresses.push({
				address: contract[config.underlying],
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

export const contractMethods = (config: ContractMethodsConfig, wallet: WalletStore): any[] => {
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
