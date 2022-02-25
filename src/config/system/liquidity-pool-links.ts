import { Network, Protocol } from '@badger-dao/sdk';
import { LiquidityPoolLinkType, NetworksLiquidityPoolLinks } from '../../mobx/model/system-config/liquidity-pool-links';

export const NETWORKS_LIQUIDITY_POOL_LINKS: NetworksLiquidityPoolLinks = {
	[Network.Ethereum]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {
			[Protocol.Curve]: 'https://curve.fi/factory-crypto/4',
			[Protocol.Sushiswap]:
				'https://app.sushi.com/add/0x3472A5A71965499acd81997a54BBA8D852C6E53d/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
			[Protocol.Uniswap]:
				'https://docs.badger.com/badger-finance/setts/sett-user-guides-ethereum/wrapped-btc-badger-uniswap-lp#how-to-deposit',
		},
		[LiquidityPoolLinkType.WBTC_DIGG]: {
			[Protocol.Sushiswap]:
				'https://app.sushi.com/add/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/0x798d1be841a82a273720ce31c822c61a67a601c3',
		},
	},
	[Network.Arbitrum]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
	[Network.Avalanche]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
	[Network.Fantom]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
	[Network.BinanceSmartChain]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
	[Network.Polygon]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
	[Network.xDai]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
	[Network.Local]: {
		[LiquidityPoolLinkType.WBTC_BADGER]: {},
		[LiquidityPoolLinkType.WBTC_DIGG]: {},
	},
};
