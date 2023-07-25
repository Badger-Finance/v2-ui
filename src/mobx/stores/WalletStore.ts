import { NetworkConfig } from '@badger-dao/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { projectId } from 'config/environment';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import Web3Modal from 'web3modal';

import { getWeb3ModalProviders } from '../../config/wallets';
import { RootStore } from './RootStore';

export class WalletStore {
  private web3Modal: Web3Modal;
  private provider?: Web3Provider;

  public address?: string;

  constructor(private store: RootStore, config: NetworkConfig) {
    if (!projectId) {
      throw new Error('You need to provide WALLET_CONNECT_PROJECT_ID env variable');
    }

    this.web3Modal = new Web3Modal({
      network: config.name,
      providerOptions: getWeb3ModalProviders(config),
      cacheProvider: true,
    });

    if (this.web3Modal.cachedProvider) {
      this.connect();
    }

    makeObservable(this, {
      address: observable,
      connect: action,
      isConnected: computed,
    });
  }

  get isConnected(): boolean {
    return this.address !== undefined;
  }

  async connect() {
    // set up whack web3 untyped (typoical) bullshit
    const provider = await this.web3Modal.connect();
    provider.on('chainChanged', this.handleChainChanged.bind(this));
    provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
    await provider.enable();

    // extract information and pass it into our app, thank fuck
    const temporaryProvider = this.getLibrary(provider);
    const connectedNetwork = await temporaryProvider.getNetwork();
    const address = await temporaryProvider.getSigner().getAddress();

    runInAction(() => {
      this.provider = temporaryProvider;
      // quickly render connection - provide address to the interface
      this.address = address;

      // sync it up
      this.store.chain.syncUrlNetworkId();
    });

    // update piece wise app components
    await this.store.updateNetwork(connectedNetwork.chainId);
    await this.store.updateProvider(temporaryProvider);
  }

  disconnect = action(() => {
    this.address = undefined;
    this.web3Modal.clearCachedProvider();
  });

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
  private getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider, 'any');
    library.pollingInterval = 15000;
    return library;
  }

  private async handleChainChanged(chainId: string) {
    await this.store.updateNetwork(Number(chainId));
    const addresses = this.address ? [this.address] : [];
    await this.handleAccountsChanged(addresses);
  }

  // ignore the accounts, web3 modal kekekeke
  private async handleAccountsChanged(accounts: string[]) {
    this.address = accounts[0];
    if (this.provider) {
      await this.store.updateProvider(this.provider);
    }
  }
}
