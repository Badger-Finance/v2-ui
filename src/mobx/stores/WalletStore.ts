import { NetworkConfig, SDKProvider } from '@badger-dao/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { GetAccountResult, GetNetworkResult } from '@wagmi/core';
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum';
import { action, computed, makeObservable, observable } from 'mobx';
import { configureChains, createClient } from 'wagmi';
import { arbitrum, fantom, localhost, mainnet } from 'wagmi/chains';

import { projectId } from '../../config/environment';
import { RootStore } from './RootStore';

const chains = [mainnet, localhost, arbitrum, fantom];

export class WalletStore {
  // private web3Modal: Web3Modal;
  private provider?: SDKProvider;

  public address?: string | undefined;
  public wagmiClient;
  public ethereumClient: EthereumClient;

  constructor(private store: RootStore, config: NetworkConfig) {
    if (!projectId) {
      throw new Error('You need to provide WALLET_CONNECT_PROJECT_ID env variable');
    }

    // Wagmi client
    const { provider } = configureChains(chains, [walletConnectProvider({ projectId })], { pollingInterval: 15000 });
    this.wagmiClient = createClient({
      autoConnect: true,
      connectors: modalConnectors({
        projectId,
        version: '2', // or "2"
        appName: 'web3Modal',
        chains,
      }),
      provider,
    });

    // Web3Modal Ethereum Client
    this.ethereumClient = new EthereumClient(this.wagmiClient, chains);

    // this.web3Modal = new Web3Modal({
    //   network: config.name,
    //   providerOptions: getWeb3ModalProviders(config),
    //   cacheProvider: true,
    // });

    // if (this.web3Modal.cachedProvider) {
    //   this.connect();
    // }

    makeObservable(this, {
      address: observable,
      connect: action,
      isConnected: computed,
    });
  }

  get isConnected(): boolean {
    return this.address !== undefined;
  }

  accountChange = action(async (account: GetAccountResult) => {
    this.address = account.address;
  });

  networkChange = action((network: GetNetworkResult) => {
    if (network?.chain?.id) this.handleChainChanged(String(network.chain.id));
  });

  providerChange = action(async (provider: SDKProvider) => {
    // const temporaryProvider = this.getLibrary(provider);
    this.provider = provider;
    this.store.chain.syncUrlNetworkId();

    // update piece wise app components
    await this.store.updateNetwork(provider.network.chainId);
    await this.store.updateProvider(provider);
  });

  async connect() {
    // // set up whack web3 untyped (typoical) bullshit
    // const provider = await this.web3Modal.connect();
    // provider.on('chainChanged', this.handleChainChanged.bind(this));
    // provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
    // await provider.enable();
    // // extract information and pass it into our app, thank fuck
    // const temporaryProvider = this.getLibrary(provider);
    // const connectedNetwork = await temporaryProvider.getNetwork();
    // const address = await temporaryProvider.getSigner().getAddress();
    // runInAction(() => {
    //   this.provider = temporaryProvider;
    //   // quickly render connection - provide address to the interface
    //   this.address = address;
    //   // sync it up
    //   this.store.chain.syncUrlNetworkId();
    // });
    // // update piece wise app components
    // await this.store.updateNetwork(connectedNetwork.chainId);
    // await this.store.updateProvider(temporaryProvider);
  }

  disconnect = action(() => {
    // this.address = undefined;
    // this.web3Modal.clearCachedProvider();
  });

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  private getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(
      provider,
      typeof provider.network.chainId === 'number'
        ? provider.network.chainId
        : typeof provider.network.chainId === 'string'
        ? parseInt(provider.network.chainId)
        : 'any',
    );
    library.pollingInterval = 15000;
    return library;
  }

  private async handleChainChanged(chainId: string) {
    await this.store.updateNetwork(Number(chainId));
    // const addresses = this.address ? [this.address] : [];
    // await this.handleAccountsChanged(addresses);
  }

  // ignore the accounts, web3 modal kekekeke
  private async handleAccountsChanged(accounts: string[]) {
    // this.address = accounts[0];
    if (this.provider) {
      await this.store.updateProvider(this.provider);
    }
  }
}
