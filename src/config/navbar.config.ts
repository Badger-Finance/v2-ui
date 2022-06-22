import { getNetworkConfig, Network } from '@badger-dao/sdk';
import { isSupportedNetwork } from 'config/wallets';

import { NavbarConfig } from './interfaces/navbar-config.interface';

const navbarConfig: Record<Network, NavbarConfig> = {
  [Network.Local]: {
    cycle: true,
    ibBTC: true,
    bridge: false,
    boost: true,
  },
  [Network.Ethereum]: {
    cycle: true,
    ibBTC: true,
    bridge: false,
    boost: true,
  },
  [Network.Arbitrum]: {
    cycle: true,
    ibBTC: false,
    bridge: false,
    boost: true,
  },
  [Network.Avalanche]: {
    cycle: false,
    ibBTC: false,
    bridge: false,
    boost: false,
  },
  [Network.BinanceSmartChain]: {
    cycle: false,
    ibBTC: false,
    bridge: false,
    boost: false,
  },
  [Network.Polygon]: {
    cycle: true,
    ibBTC: false,
    bridge: false,
    boost: false,
  },
  [Network.Fantom]: {
    cycle: false,
    ibBTC: false,
    bridge: false,
    boost: false,
  },
  [Network.Optimism]: {
    cycle: false,
    ibBTC: false,
    bridge: false,
    boost: false,
  },
};

export function getNavbarConfig(network?: Network): NavbarConfig {
  const chain = Network.Ethereum;
  try {
    const config = getNetworkConfig(network ?? chain);
    if (isSupportedNetwork(config.chainId)) {
      return navbarConfig[config.network];
    }
  } catch {} // ignore network not found error - defaults to ethereum
  return navbarConfig[chain];
}
