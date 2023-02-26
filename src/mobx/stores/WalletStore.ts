import { SDKProvider } from '@badger-dao/sdk';
import { Address, GetAccountResult, GetNetworkResult } from '@wagmi/core';
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum';
import { Signer } from 'ethers';
import { action, computed, makeObservable, observable } from 'mobx';
import { configureChains, createClient } from 'wagmi';
import { arbitrum, fantom, localhost, mainnet } from 'wagmi/chains';

import { LOCAL, projectId } from '../../config/environment';
import { RootStore } from './RootStore';

export const chains = LOCAL ? [mainnet, localhost, arbitrum, fantom] : [mainnet, arbitrum, fantom];

export class WalletStore {
  public address?: string | undefined;
  public wagmiClient;
  public ethereumClient: EthereumClient;

  constructor(private store: RootStore) {
    if (!projectId) {
      throw new Error('You need to provide WALLET_CONNECT_PROJECT_ID env variable');
    }

    // Wagmi client
    const { provider } = configureChains(chains, [walletConnectProvider({ projectId })], {
      pollingInterval: 15000,
    });
    this.wagmiClient = createClient({
      autoConnect: true,
      connectors: modalConnectors({
        projectId,
        version: '2', // or "2"
        appName: 'BadgerDAO',
        chains,
      }),
      provider,
    });

    // Web3Modal Ethereum Client
    this.ethereumClient = new EthereumClient(this.wagmiClient, chains);

    makeObservable(this, {
      address: observable,
      isConnected: computed,
    });
  }

  get isConnected(): boolean {
    return this.address !== undefined;
  }

  /**
   * Account change handler
   */
  accountChange = action(async (account: GetAccountResult) => {
    this.address = account.address;
  });

  /**
   * Chain change handler
   */
  networkChange = action(async (network: GetNetworkResult) => {
    if (network?.chain?.id) {
      await this.store.updateNetwork(Number(network.chain.id));
    }
  });

  providerChange = action(async (provider: SDKProvider, signer: Signer, address: Address) => {
    this.address = address;
    this.store.chain.syncUrlNetworkId();

    // update piece wise app components
    await this.store.updateNetwork(provider.network.chainId);
    await this.store.updateProvider(provider, signer);
  });

  disconnect = action(() => {
    this.address = undefined;
  });
}
