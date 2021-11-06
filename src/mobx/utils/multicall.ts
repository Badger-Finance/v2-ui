import { CallReturnContext } from 'ethereum-multicall';
import { Network } from '@badger-dao/sdk';

export function getChainMulticallContract(network: Network): string {
	switch (network) {
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
			return '0xb828c456600857abd4ed6c32facc607bd0464f4f';
	}
}

export function parseCallReturnContext<T = any>(returnContext: CallReturnContext[]): T {
	let returnObject = {};

	for (const returnContextKey in returnContext) {
		const { returnValues, methodName } = returnContext[returnContextKey];

		returnObject = {
			...returnObject,
			[methodName]: returnValues,
		};
	}

	return returnObject as T;
}
