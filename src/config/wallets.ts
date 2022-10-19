import { getNetworkConfig, NetworkConfig } from '@badger-dao/sdk';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { CHAIN_DATA_LIST } from 'web3modal';

import { NETWORK_IDS } from './constants';
import { supportedNetworks } from './networks.config';
import rpc from './rpc.config';

export function isSupportedNetwork(chainId?: number): boolean {
  if (!chainId) {
    return true;
  }
  try {
    // verify sdk support for given chain
    const config = getNetworkConfig(chainId);
    return new Set(supportedNetworks.map((network) => network.id)).has(config.chainId);
  } catch {
    return false;
  }
}

export function getWeb3ModalProviders(config: NetworkConfig) {
  // wallet connect / portis network names are different from ours, and they throw an error if they don't match
  const network = Object.values(CHAIN_DATA_LIST).find((network) => network.chainId === config.chainId)?.network;
  const networkRPC = rpc[config.network];
  return {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          [NETWORK_IDS.ETH]: networkRPC,
          [NETWORK_IDS.BSC]: networkRPC,
          [NETWORK_IDS.ARB]: networkRPC,
          [NETWORK_IDS.FTM]: networkRPC,
          [NETWORK_IDS.MATIC]: networkRPC,
        },
        network,
      },
    },
  };
}
