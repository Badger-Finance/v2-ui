import { Network, Protocol } from '@badger-dao/sdk';

export enum LiquidityPoolLinkType {
	WBTC_BADGER = 'wbtc-badger',
	WBTC_DIGG = 'wbtc-digg',
}

export type LiquidityPoolLink = {
	[K in Protocol]?: string;
};

export type LiquidityPoolLinks = Record<LiquidityPoolLinkType, LiquidityPoolLink>;
export type NetworksLiquidityPoolLinks = Record<Network, LiquidityPoolLinks>;
