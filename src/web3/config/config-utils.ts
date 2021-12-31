import { ERC20_ABI, GUEST_LIST_ABI, SETT_ABI } from 'config/constants';
import { AbiItem } from 'web3-utils';
import { ContractCallContext } from 'ethereum-multicall';
import { BalanceNamespace, ContractNamespaces } from './namespaces';
import Web3 from 'web3';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';
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
		case BalanceNamespace.Vault:
		case BalanceNamespace.GuardedVault:
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
	generalVaultAddresses,
	guardedVaultAddresses,
	deprecatedVaultAddresses,
	userAddress,
}: BalancesRequestAddresses): ContractCallContext[] => {
	return [
		...createMulticallRequest(tokenAddresses, BalanceNamespace.Token, userAddress),
		...createMulticallRequest(generalVaultAddresses, BalanceNamespace.Vault, userAddress),
		...createMulticallRequest(guardedVaultAddresses, BalanceNamespace.GuardedVault, userAddress),
		...createMulticallRequest(deprecatedVaultAddresses, BalanceNamespace.Deprecated, userAddress),
	];
};

export const toVaultConfig = (definitions: BadgerVault[]): BadgerVault[] => {
	return definitions.map((vault) => ({
		depositToken: {
			...vault.depositToken,
			address: Web3.utils.toChecksumAddress(vault.depositToken.address),
		},
		vaultToken: {
			...vault.vaultToken,
			address: Web3.utils.toChecksumAddress(vault.vaultToken.address),
		},
		geyser: vault.geyser ? Web3.utils.toChecksumAddress(vault.geyser) : undefined,
	}));
};

const getMulticallContractCalls = (
	namespace: ContractNamespaces | BalanceNamespace,
	userAddress: string,
): ContractCallContext['calls'] => {
	switch (namespace) {
		case BalanceNamespace.GuardedVault:
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
		case BalanceNamespace.Vault:
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
