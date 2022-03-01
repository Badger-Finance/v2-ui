import { CallReturnContext } from 'ethereum-multicall';
import { Network } from '@badger-dao/sdk';
import { groupBy } from '../../utils/lodashToNative';

// the reason why there are multiple returnValues is because the method can be called multiple times hence can have multiple results
export type ParsedCallReturn = Record<string, CallReturnContext['returnValues'][]>;

export function getChainMulticallContract(network: Network): string {
	switch (network) {
		case Network.Local:
		case Network.Ethereum:
			return '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696';
		case Network.Polygon:
			return '0x275617327c958bD06b5D6b871E7f491D76113dd8';
		case Network.BinanceSmartChain:
			return '0xC50F4c1E81c873B2204D7eFf7069Ffec6Fbe136D';
		case Network.Arbitrum:
			return '0x80C7DD17B01855a6D2347444a0FCC36136a314de';
		case Network.Avalanche:
			return '0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4';
		case Network.xDai:
			return '0x2325b72990D81892E0e09cdE5C80DD221F147F8B';
		case Network.Fantom:
			return '0xd98e3dbe5950ca8ce5a4b59630a5652110403e5c';
	}
}

export function parseCallReturnContext(returnContext: CallReturnContext[]): ParsedCallReturn {
	const returnObject: ParsedCallReturn = {};
	const groupedResults = groupBy(returnContext, (context) => context.methodName);

	for (const methodName in groupedResults) {
		returnObject[methodName] = groupedResults[methodName].map((result: CallReturnContext) => result.returnValues);
	}

	return returnObject;
}
