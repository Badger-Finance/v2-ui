import { Network, Protocol } from '@badger-dao/sdk';

export enum LiquidityPoolLinkToken {
	BADGER = 'badger',
	DIGG = 'digg',
}

export type LiquidityPoolLink = {
	[K in Protocol]?: string;
};

export type LiquidityPoolLinks = {
	[K in LiquidityPoolLinkToken]?: LiquidityPoolLink;
};

export type NetworksLiquidityPoolLinks = Record<Network, LiquidityPoolLinks>;
