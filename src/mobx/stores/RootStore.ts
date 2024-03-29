import { BadgerAPI, BadgerSDK, getNetworkConfig, LogLevel, SDKProvider } from '@badger-dao/sdk';
import { defaultNetwork } from 'config/networks.config';
import { action, makeObservable, observable } from 'mobx';
import { RouterStore } from 'mobx-router';

import { BADGER_API } from '../../config/environment';
import rpc from '../../config/rpc.config';
import GasPricesStore from './GasPricesStore';
import IbBTCStore from './ibBTCStore';
import InfluenceVaultStore from './InfluenceVaultStore';
import LockedDepositsStore from './LockedDepositsStore';
import { NetworkStore } from './NetworkStore';
import PricesStore from './PricesStore';
import RebaseStore from './rebaseStore';
import TransactionsStore from './TransactionsStore';
import { TreeStore } from './TreeStore';
import UiStateStore from './uiStore';
import UserStore from './UserStore';
import { VaultChartsStore } from './VaultChartsStore';
import { VaultDetailStore } from './VaultDetail.store';
import VaultStore from './VaultStore';
import { WalletStore } from './WalletStore';

export class RootStore {
  // Badger SDK Utilized Objects
  public sdk: BadgerSDK;
  public api: BadgerAPI;

  // Router
  public router: RouterStore<RootStore>;

  // Stores
  public chain: NetworkStore;
  public uiState: UiStateStore;
  public rebase: RebaseStore;
  public wallet: WalletStore;
  public ibBTCStore: IbBTCStore;
  public vaults: VaultStore;
  public user: UserStore;
  public prices: PricesStore;
  public vaultDetail: VaultDetailStore;
  public vaultCharts: VaultChartsStore;
  public gasPrices: GasPricesStore;
  public lockedDeposits: LockedDepositsStore;
  public transactions: TransactionsStore;
  public influenceVaultStore: InfluenceVaultStore;

  // New Stores
  public tree: TreeStore;

  constructor() {
    this.sdk = new BadgerSDK({
      network: defaultNetwork,
      provider: rpc[defaultNetwork],
      baseURL: BADGER_API,
      logLevel: LogLevel.Debug,
    });
    this.api = new BadgerAPI({
      network: defaultNetwork,
      baseURL: BADGER_API,
    });
    const config = getNetworkConfig(defaultNetwork);
    this.router = new RouterStore<RootStore>(this);
    this.chain = new NetworkStore(this);
    this.wallet = new WalletStore(this, config);
    this.prices = new PricesStore(this);
    this.rebase = new RebaseStore();
    this.uiState = new UiStateStore();
    this.vaults = new VaultStore(this);
    this.user = new UserStore(this);
    this.vaultDetail = new VaultDetailStore(this);
    this.vaultCharts = new VaultChartsStore(this);
    this.gasPrices = new GasPricesStore(this);
    this.ibBTCStore = new IbBTCStore(this);
    this.lockedDeposits = new LockedDepositsStore(this);
    this.influenceVaultStore = new InfluenceVaultStore(this);

    // new stores
    this.tree = new TreeStore(this);
    this.transactions = new TransactionsStore(this);

    makeObservable(this, {
      sdk: observable,
      updateNetwork: action,
      updateProvider: action,
    });
  }

  async updateNetwork(network: number): Promise<void> {
    const config = getNetworkConfig(network);

    // push network state to app
    if (this.chain.network !== config.network) {
      this.chain.network = config.network;
    }

    this.api = new BadgerAPI({
      network,
      baseURL: BADGER_API,
    });

    this.tree.reset();

    const refreshData = [this.chain.updateGasPrices(), this.vaults.refresh(), this.prices.loadPrices()];

    await Promise.all(refreshData);
  }

  async updateProvider(provider: SDKProvider): Promise<void> {
    this.tree.reset();
    const { network } = this.chain;

    this.sdk = new BadgerSDK({
      network: network,
      provider,
      baseURL: BADGER_API,
      logLevel: LogLevel.Debug,
    });
    await this.sdk.ready();

    const { signer, address } = this.sdk;

    if (signer && address) {
      const updateActions = [this.lockedDeposits.loadLockedBalances(), this.user.reloadBalances()];

      if (this.sdk.rewards.hasBadgerTree()) {
        updateActions.push(this.tree.loadBadgerTree());
      }

      await Promise.all(updateActions);
    }
  }
}

const store = new RootStore();

export default store;
