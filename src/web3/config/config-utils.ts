import { ERC20_ABI, GEYSER_ABI, GUEST_LIST_ABI, SETT_ABI } from 'config/constants';
import { ethers } from 'ethers';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { AbiItem } from 'web3-utils';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { ReadMethod } from 'web3/interface/read-method';
import { ContractNamespace } from './contract-namespace';

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
			address: ethers.utils.getAddress(sett.depositToken.address),
		},
		vaultToken: {
			...sett.vaultToken,
			address: ethers.utils.getAddress(sett.vaultToken.address),
		},
		geyser: sett.geyser ? ethers.utils.getAddress(sett.geyser) : undefined,
	}));
};
