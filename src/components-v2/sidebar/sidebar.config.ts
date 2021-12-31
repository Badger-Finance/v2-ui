import { Network } from '@badger-dao/sdk';
import { SidebarConfig } from './interface/sidebar-config.interface';

const sidebarConfig: Record<Network, SidebarConfig> = {
  [Network.Ethereum]: {
    cycle: true,
    digg: true,
    ibBTC: true,
    bridge: true,
    boost: true,
    arcade: true,
  },
  [Network.Arbitrum]: {
    cycle: true,
    digg: false,
    ibBTC: false,
    bridge: false,
    boost: true,
    arcade: false,
  },
  [Network.Avalanche]: {
    cycle: false,
    digg: false,
    ibBTC: false,
    bridge: false,
    boost: false,
    arcade: false,
  },
  [Network.BinanceSmartChain]: {
    cycle: false,
    digg: false,
    ibBTC: false,
    bridge: false,
    boost: false,
    arcade: false,
  },
  [Network.Polygon]: {
    cycle: true,
    digg: false,
    ibBTC: false,
    bridge: false,
    boost: false,
    arcade: false,
  },
  [Network.Fantom]: {
    cycle: false,
    digg: false,
    ibBTC: false,
    bridge: false,
    boost: false,
    arcade: false,
  },
  [Network.xDai]: {
    cycle: false,
    digg: false,
    ibBTC: false,
    bridge: false,
    boost: false,
    arcade: false,
  },
};

export function getSidebarConfig(network: Network): SidebarConfig {
  return sidebarConfig[network];
}
