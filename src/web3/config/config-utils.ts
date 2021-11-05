import { ERC20_ABI, GEYSER_ABI, GUEST_LIST_ABI, SETT_ABI } from 'config/constants';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { ContractCallContext } from 'ethereum-multicall';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { ReadMethod } from 'web3/interface/read-method';
import { ContractNamespace } from './contract-namespace';

interface CreateMultichainConfigParams {
	tokenAddresses: string[];
	generalSettAddresses: string[];
	guardedSettAddresses: string[];
	geyserAddresses: string[];
	userAddress: string;
	nonSettTokenAddresses?: string[];
}

export const createBatchCallRequest = (
	tokens: string[],
	namespace: ContractNamespace,
	userAddress: string,
): BatchCallRequest => {
	let abi: AbiItem[];
	switch (namespace) {
		case ContractNamespace.GuestList:
			abi = GUEST_LIST_ABI;
			break;
		case ContractNamespace.Sett:
		case ContractNamespace.GaurdedSett:
			abi = SETT_ABI;
			break;
		case ContractNamespace.Geyser:
			abi = GEYSER_ABI;
			break;
		default:
			abi = ERC20_ABI;
			break;
	}
	return {
		namespace: namespace,
		addresses: tokens,
		abi,
		store: 'localhost',
		groupByNamespace: true,
		logging: false,
		simplifyResponse: false,
		allReadMethods: false,
		readMethods: getReadMethods(namespace, userAddress),
	};
};

export const createMulticallRequest = (
	tokens: string[],
	namespace: ContractNamespace,
	userAddress: string,
): ContractCallContext[] => {
	let abi: AbiItem[];

	switch (namespace) {
		case ContractNamespace.GuestList:
			abi = GUEST_LIST_ABI;
			break;
		case ContractNamespace.Sett:
		case ContractNamespace.GaurdedSett:
			abi = SETT_ABI;
			break;
		case ContractNamespace.Geyser:
			abi = GEYSER_ABI;
			break;
		default:
			abi = ERC20_ABI;
			break;
	}

	return tokens.map((token) => ({
		reference: token,
		contractAddress: token,
		abi,
		calls: getMulticallContractCalls(namespace, userAddress),
		context: {
			namespace,
		},
	}));
};

const getReadMethods = (namespace: ContractNamespace, userAddress: string): ReadMethod[] => {
	switch (namespace) {
		case ContractNamespace.Geyser:
			return [{ name: 'totalStakedFor', args: [userAddress] }];
		case ContractNamespace.GaurdedSett:
			return [{ name: 'balanceOf', args: [userAddress] }, { name: 'guestList' }, { name: 'available' }];
		case ContractNamespace.GuestList:
			return [
				{ name: 'remainingTotalDepositAllowed' },
				{ name: 'remainingUserDepositAllowed', args: [userAddress] },
				{ name: 'totalDepositCap' },
				{ name: 'userDepositCap' },
			];
		case ContractNamespace.Sett:
			return [{ name: 'balanceOf', args: [userAddress] }, { name: 'available' }];
		case ContractNamespace.Token:
		default:
			return [{ name: 'balanceOf', args: [userAddress] }];
	}
};

const getMulticallContractCalls = (namespace: ContractNamespace, userAddress: string): ContractCallContext['calls'] => {
	switch (namespace) {
		case ContractNamespace.Geyser:
			return [{ methodName: 'totalStakedFor', methodParameters: [userAddress], reference: namespace }];
		case ContractNamespace.GaurdedSett:
			return [
				{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'guestList', reference: namespace, methodParameters: [] },
				{ methodName: 'available', reference: namespace, methodParameters: [] },
			];
		case ContractNamespace.GuestList:
			return [
				{ methodName: 'remainingTotalDepositAllowed', reference: namespace, methodParameters: [] },
				{ methodName: 'remainingUserDepositAllowed', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'totalDepositCap', reference: namespace, methodParameters: [] },
				{ methodName: 'userDepositCap', reference: namespace, methodParameters: [] },
			];
		case ContractNamespace.Sett:
			return [
				{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'available', methodParameters: [], reference: namespace },
			];
		case ContractNamespace.Token:
		default:
			return [{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace }];
	}
};

export const createChainMulticallConfig = ({
	tokenAddresses,
	generalSettAddresses,
	geyserAddresses,
	guardedSettAddresses,
	nonSettTokenAddresses,
	userAddress,
}: CreateMultichainConfigParams): ContractCallContext[] => {
	let batchCall = [
		...createMulticallRequest(tokenAddresses, ContractNamespace.Token, userAddress),
		...createMulticallRequest(generalSettAddresses, ContractNamespace.Sett, userAddress),
		...createMulticallRequest(guardedSettAddresses, ContractNamespace.GaurdedSett, userAddress),
		...createMulticallRequest(geyserAddresses, ContractNamespace.Geyser, userAddress),
	];

	if (!!nonSettTokenAddresses) {
		batchCall = batchCall.concat(
			createMulticallRequest(nonSettTokenAddresses, ContractNamespace.NonSettToken, userAddress),
		);
	}

	return batchCall;
};

export const createChainBatchConfig = (
	tokenAddresses: string[],
	generalSettAddresses: string[],
	guardedSettAddresses: string[],
	geyserAddresses: string[],
	userAddress: string,
	nonSettTokenAddresses?: string[],
): BatchCallRequest[] => {
	const batchCall = [
		createBatchCallRequest(tokenAddresses, ContractNamespace.Token, userAddress),
		createBatchCallRequest(generalSettAddresses, ContractNamespace.Sett, userAddress),
		createBatchCallRequest(guardedSettAddresses, ContractNamespace.GaurdedSett, userAddress),
		createBatchCallRequest(geyserAddresses, ContractNamespace.Geyser, userAddress),
	];

	if (!!nonSettTokenAddresses) {
		batchCall.push(createBatchCallRequest(nonSettTokenAddresses, ContractNamespace.NonSettToken, userAddress));
	}

	return batchCall;
};

export const toSettConfig = (definitions: BadgerSett[]): BadgerSett[] => {
	return definitions.map((sett) => ({
		depositToken: {
			...sett.depositToken,
			address: Web3.utils.toChecksumAddress(sett.depositToken.address),
		},
		vaultToken: {
			...sett.vaultToken,
			address: Web3.utils.toChecksumAddress(sett.vaultToken.address),
		},
		geyser: sett.geyser ? Web3.utils.toChecksumAddress(sett.geyser) : undefined,
	}));
};
