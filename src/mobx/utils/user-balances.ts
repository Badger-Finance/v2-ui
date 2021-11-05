import { ContractCallResults } from 'ethereum-multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';

export enum BalanceNamespace {
	Token = 'token',
	Sett = 'sett',
	Geyser = 'geyser',
	GuardedSett = 'gaurded',
	NonSettToken = 'nonsetttoken',
}

interface RequestExtractedResults {
	userTokens: ContractCallReturnContext[];
	nonSettUserTokens: ContractCallReturnContext[];
	userGeneralSetts: ContractCallReturnContext[];
	userGuardedSetts: ContractCallReturnContext[];
	userGeysers: ContractCallReturnContext[];
}

/**
 * Extracts the information of the balances multicall request
 * @param contractCallResults request raw result
 */
export function extractRequestResults(contractCallResults: ContractCallResults): RequestExtractedResults {
	const userTokens: ContractCallReturnContext[] = [];
	const nonSettUserTokens: ContractCallReturnContext[] = [];
	const userGeneralSetts: ContractCallReturnContext[] = [];
	const userGuardedSetts: ContractCallReturnContext[] = [];
	const userGeysers: ContractCallReturnContext[] = [];

	for (const resultsKey in contractCallResults.results) {
		const results = contractCallResults.results[resultsKey];

		const namespace = results.originalContractCallContext.context.namespace as BalanceNamespace;
		const validNamespaces = Object.values(BalanceNamespace);

		if (!namespace || !validNamespaces.includes(namespace)) {
			console.error(`namespace could not be extracted from call reference ${namespace}`);
			continue;
		}

		switch (namespace) {
			case BalanceNamespace.Token:
				userTokens.push(results);
				break;
			case BalanceNamespace.NonSettToken:
				nonSettUserTokens.push(results);
				break;
			case BalanceNamespace.Sett:
				userGeneralSetts.push(results);
				break;
			case BalanceNamespace.GuardedSett:
				userGuardedSetts.push(results);
				break;
			case BalanceNamespace.Geyser:
				userGeysers.push(results);
				break;
		}
	}

	return {
		userTokens,
		nonSettUserTokens,
		userGeneralSetts,
		userGuardedSetts,
		userGeysers,
	};
}
