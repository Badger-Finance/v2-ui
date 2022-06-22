import { Network, Protocol } from '@badger-dao/sdk';

import {
  LiquidityPoolLinkToken,
  NetworksLiquidityPoolLinks,
} from '../../mobx/model/system-config/liquidity-pool-links';

export const NETWORKS_LIQUIDITY_POOL_LINKS: NetworksLiquidityPoolLinks = {
  [Network.Ethereum]: {
    [LiquidityPoolLinkToken.BADGER]: {
      [Protocol.Curve]: 'https://curve.fi/factory-crypto/4',
      [Protocol.Sushiswap]:
        'https://app.sushi.com/swap?inputCurrency=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599&outputCurrency=0x3472A5A71965499acd81997a54BBA8D852C6E53d',
      [Protocol.Uniswap]:
        'https://app.uniswap.org/#/swap?inputCurrency=0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599&outputCurrency=0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    },
    [LiquidityPoolLinkToken.DIGG]: {
      [Protocol.Sushiswap]:
        'https://app.sushi.com/swap?inputCurrency=0x2260fac5e5542a773aa44fbcfedf7c193bc2c599&outputCurrency=0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    },
  },
  [Network.Arbitrum]: {
    [LiquidityPoolLinkToken.BADGER]: {
      [Protocol.Swapr]:
        'https://swapr.eth.link/#/swap?inputCurrency=ETH&outputCurrency=0xbfa641051ba0a0ad1b0acf549a89536a0d76472e&chainId=42161',
    },
  },
  [Network.Avalanche]: {},
  [Network.Fantom]: {
    [LiquidityPoolLinkToken.BADGER]: {
      [Protocol.Spookyswap]:
        'https://spookyswap.finance/swap?inputCurrency=0x321162Cd933E2Be498Cd2267a90534A804051b11&outputCurrency=0x753fbc5800a8C8e3Fb6DC6415810d627A387Dfc9',
    },
  },
  [Network.BinanceSmartChain]: {},
  [Network.Polygon]: {},
  [Network.Local]: {},
  [Network.Optimism]: {},
};
