import { ERC20_ABI, GUEST_LIST_ABI, SETT_ABI } from 'config/constants';
import { AbiItem } from 'web3-utils';
import { ContractCallContext } from 'ethereum-multicall';
import { BalanceNamespace, ContractNamespaces } from './namespaces';
import Web3 from 'web3';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { BalancesRequestAddresses } from '../../mobx/model/account/user-balances';

export const createMulticallRequest = (
	addresses: string[],
	namespace: ContractNamespaces | BalanceNamespace,
	userAddress: string,
): ContractCallContext[] => {
	let abi: AbiItem[];

	switch (namespace) {
		case ContractNamespaces.GuestList:
			abi = GUEST_LIST_ABI;
			break;
		case BalanceNamespace.Deprecated:
		case BalanceNamespace.Sett:
		case BalanceNamespace.GuardedSett:
			abi = SETT_ABI;
			break;
		default:
			abi = ERC20_ABI;
			break;
	}

	return addresses.map((address) => ({
		reference: address,
		contractAddress: address,
		abi,
		calls: getMulticallContractCalls(namespace, userAddress),
		context: {
			namespace,
		},
	}));
};

export const createBalancesRequest = ({
	tokenAddresses,
	generalSettAddresses,
	guardedSettAddresses,
	deprecatedSettAddresses,
	userAddress,
}: BalancesRequestAddresses): ContractCallContext[] => {
	return [
		...createMulticallRequest(tokenAddresses, BalanceNamespace.Token, userAddress),
		...createMulticallRequest(generalSettAddresses, BalanceNamespace.Sett, userAddress),
		...createMulticallRequest(guardedSettAddresses, BalanceNamespace.GuardedSett, userAddress),
		...createMulticallRequest(deprecatedSettAddresses, BalanceNamespace.Deprecated, userAddress),
	];
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

const getMulticallContractCalls = (
	namespace: ContractNamespaces | BalanceNamespace,
	userAddress: string,
): ContractCallContext['calls'] => {
	switch (namespace) {
		case BalanceNamespace.GuardedSett:
			return [
				{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'guestList', reference: namespace, methodParameters: [] },
				{ methodName: 'available', reference: namespace, methodParameters: [] },
			];
		case ContractNamespaces.GuestList:
			return [
				{ methodName: 'remainingTotalDepositAllowed', reference: namespace, methodParameters: [] },
				{ methodName: 'remainingUserDepositAllowed', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'totalDepositCap', reference: namespace, methodParameters: [] },
				{ methodName: 'userDepositCap', reference: namespace, methodParameters: [] },
			];
		case BalanceNamespace.Sett:
		case BalanceNamespace.Deprecated:
			return [
				{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'available', methodParameters: [], reference: namespace },
			];
		case BalanceNamespace.Token:
		default:
			return [{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace }];
	}
};
