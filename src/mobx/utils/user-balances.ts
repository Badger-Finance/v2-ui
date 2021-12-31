import { ContractCallResults } from 'ethereum-multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';
import { BalanceNamespace } from '../../web3/config/namespaces';

export interface RequestExtractedResults {
  userTokens: ContractCallReturnContext[];
  userGeneralSetts: ContractCallReturnContext[];
  userGuardedSetts: ContractCallReturnContext[];
  userDeprecatedSetts: ContractCallReturnContext[];
}

/**
 * Extracts the information of the balances multicall request
 * @param contractCallResults request raw result
 */
export function extractBalanceRequestResults(contractCallResults: ContractCallResults): RequestExtractedResults {
  const userTokens: ContractCallReturnContext[] = [];
  const userGeneralSetts: ContractCallReturnContext[] = [];
  const userGuardedSetts: ContractCallReturnContext[] = [];
  const userDeprecatedSetts: ContractCallReturnContext[] = [];

  for (const results of Object.values(contractCallResults.results)) {
    const namespace = results.originalContractCallContext.context.namespace as BalanceNamespace;
    const validNamespaces = Object.values(BalanceNamespace);

    if (!namespace || !validNamespaces.includes(namespace)) {
      console.error(`namespace could not be extracted from call reference ${namespace}`);
      continue;
    }

    switch (namespace) {
      case BalanceNamespace.Sett:
        userGeneralSetts.push(results);
        break;
      case BalanceNamespace.GuardedSett:
        userGuardedSetts.push(results);
        break;
      case BalanceNamespace.Deprecated:
        userDeprecatedSetts.push(results);
        break;
      case BalanceNamespace.Token:
      default:
        userTokens.push(results);
    }
  }

  return {
    userTokens,
    userGeneralSetts,
    userGuardedSetts,
    userDeprecatedSetts,
  };
}
