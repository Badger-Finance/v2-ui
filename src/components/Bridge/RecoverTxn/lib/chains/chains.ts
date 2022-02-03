import { ChainCommon, MintChain, RenNetwork } from '@renproject/interfaces';
import {
	BitcoinDetails,
	ZcashDetails,
	BitcoinCashDetails,
	DibiByteDetails,
	FilecoinDetails,
	LunaDetails,
	DogecoinDetails,
} from './chains/lockChains';
import {
	ArbitrumDetails,
	AvalancheDetails,
	BinanceSmartChainDetails,
	EthereumDetails,
	FantomDetails,
	GoerliDetails,
	PolygonDetails,
} from './chains/evmChains';
import { SolanaDetails } from './chains/solana';

export const mintChains = [
	EthereumDetails,
	BinanceSmartChainDetails,
	FantomDetails,
	PolygonDetails,
	AvalancheDetails,
	GoerliDetails,
	ArbitrumDetails,
	SolanaDetails,
];

export const lockChains = [
	BitcoinDetails,
	ZcashDetails,
	BitcoinCashDetails,
	DibiByteDetails,
	FilecoinDetails,
	LunaDetails,
	DogecoinDetails,
];

export const allChains = [...mintChains, ...lockChains];

export const ChainMapper = (chainName: string, network: RenNetwork): ChainCommon | null => {
	for (const chain of mintChains) {
		if (chain.chainPattern.exec(chainName)) {
			return chain.usePublicProvider(network);
		}
	}

	for (const chain of lockChains) {
		if (chain.chainPattern.exec(chainName)) {
			return chain.usePublicProvider(network);
		}
	}

	console.error(`Couldn't find chain ${chainName}`);

	return null;
};

export const getMintChainParams = async (
	mintChain: MintChain,
	to: string,
	payload: string,
	asset: string,
): Promise<MintChain> => {
	for (const chainDetails of mintChains) {
		if (chainDetails.chainPattern.exec(mintChain.name)) {
			if (chainDetails && chainDetails.getMintParams) {
				return chainDetails.getMintParams(mintChain, to, payload, asset);
			} else {
				throw new Error(`Reconstructing mint parameters for ${mintChain.name} is not supported yet.`);
			}
		}
	}

	throw new Error(`Unable to get parameters for ${mintChain.name}`);
};
