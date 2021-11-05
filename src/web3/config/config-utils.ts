import { ERC20_ABI, GEYSER_ABI, GUEST_LIST_ABI, SETT_ABI } from 'config/constants';
import { AbiItem } from 'web3-utils';
import { ContractCallContext } from 'ethereum-multicall';
import { BalanceNamespace, ContractNamespaces } from './namespaces';
import Web3 from 'web3';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { BalancesRequestAddresses } from '../../mobx/model/account/user-balances';

export const createMulticallRequest = (
	tokens: string[],
	namespace: ContractNamespaces | BalanceNamespace,
	userAddress: string,
): ContractCallContext[] => {
	let abi: AbiItem[];

	switch (namespace) {
		case ContractNamespaces.GuestList:
			abi = GUEST_LIST_ABI;
			break;
		case BalanceNamespace.Sett:
		case BalanceNamespace.GuardedSett:
			abi = SETT_ABI;
			break;
		case BalanceNamespace.Geyser:
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

export const createBalancesRequest = ({
	tokenAddresses,
	generalSettAddresses,
	geyserAddresses,
	guardedSettAddresses,
	nonSettTokenAddresses,
	userAddress,
}: BalancesRequestAddresses): ContractCallContext[] => {
	let multicall = [
		...createMulticallRequest(tokenAddresses, BalanceNamespace.Token, userAddress),
		...createMulticallRequest(generalSettAddresses, BalanceNamespace.Sett, userAddress),
		...createMulticallRequest(guardedSettAddresses, BalanceNamespace.GuardedSett, userAddress),
		...createMulticallRequest(geyserAddresses, BalanceNamespace.Geyser, userAddress),
	];

	if (!!nonSettTokenAddresses) {
		multicall = multicall.concat(
			createMulticallRequest(nonSettTokenAddresses, BalanceNamespace.NonSettToken, userAddress),
		);
	}

	return multicall;
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
		case BalanceNamespace.Geyser:
			return [{ methodName: 'totalStakedFor', methodParameters: [userAddress], reference: namespace }];
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
			return [
				{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace },
				{ methodName: 'available', methodParameters: [], reference: namespace },
			];
		case BalanceNamespace.Token:
		default:
			return [{ methodName: 'balanceOf', methodParameters: [userAddress], reference: namespace }];
	}
};
