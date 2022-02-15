import { LockChain, MintChain, RenNetwork } from '@renproject/interfaces';

export interface ChainDetails<ChainType extends MintChain | LockChain = MintChain | LockChain> {
	chain: string;
	chainPattern: RegExp;

	usePublicProvider: (network: RenNetwork) => ChainType | null;

	nativeAssets: Array<{
		symbol: string;
		name: string;
	}>;

	getMintParams?: (mintChain: MintChain, to: string, payload: string, asset: string) => Promise<MintChain>;

	getTokenAccount?: (mintChain: MintChain, asset: string) => Promise<string | null>;

	createTokenAccount?: (mintChain: MintChain, asset: string) => Promise<string>;
}
