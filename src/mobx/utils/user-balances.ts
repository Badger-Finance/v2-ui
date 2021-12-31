import { ContractCallResults } from 'ethereum-multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';
import { BalanceNamespace } from '../../web3/config/namespaces';

export interface RequestExtractedResults {
	userTokens: ContractCallReturnContext[];
	userGeneralVaults: ContractCallReturnContext[];
	userGuardedVaults: ContractCallReturnContext[];
	userDeprecatedVaults: ContractCallReturnContext[];
}

/**
 * Extracts the information of the balances multicall request
 * @param contractCallResults request raw result
 */
export function extractBalanceRequestResults(contractCallResults: ContractCallResults): RequestExtractedResults {
	const userTokens: ContractCallReturnContext[] = [];
	const userGeneralVaults: ContractCallReturnContext[] = [];
	const userGuardedVaults: ContractCallReturnContext[] = [];
	const userDeprecatedVaults: ContractCallReturnContext[] = [];

	for (const results of Object.values(contractCallResults.results)) {
		const namespace = results.originalContractCallContext.context.namespace as BalanceNamespace;
		const validNamespaces = Object.values(BalanceNamespace);

		if (!namespace || !validNamespaces.includes(namespace)) {
			console.error(`namespace could not be extracted from call reference ${namespace}`);
			continue;
		}

		switch (namespace) {
			case BalanceNamespace.Vault:
				userGeneralVaults.push(results);
				break;
			case BalanceNamespace.GuardedVault:
				userGuardedVaults.push(results);
				break;
			case BalanceNamespace.Deprecated:
				userDeprecatedVaults.push(results);
				break;
			case BalanceNamespace.Token:
			default:
				userTokens.push(results);
		}
	}

	return {
		userTokens,
		userGeneralVaults,
		userGuardedVaults,
		userDeprecatedVaults,
	};
}
