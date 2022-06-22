import {
  BadgerAPI,
  BadgerSDK,
  getNetworkConfig,
  SDKProvider,
} from '@badger-dao/sdk';
import { defaultNetwork } from 'config/networks.config';
import { action, makeObservable, observable } from 'mobx';
import { RouterStore } from 'mobx-router';

import { NETWORK_IDS } from '../../config/constants';
import { BADGER_API } from '../../config/environment';
import rpc from '../../config/rpc.config';
import { Network } from '../model/network/network';
import GasPricesStore from './GasPricesStore';
import { GovernancePortalStore } from './GovernancePortalStore';
import LockedCvxDelegationStore from './lockedCvxDelegationStore';
import LockedDepositsStore from './LockedDepositsStore';
import { NetworkStore } from './NetworkStore';
import PricesStore from './PricesStore';
import RebaseStore from './rebaseStore';
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
  public network: NetworkStore;
  public uiState: UiStateStore;
  public rebase: RebaseStore;
  public wallet: WalletStore;
  // public ibBTCStore: IbBTCStore;
  public vaults: VaultStore;
  public user: UserStore;
  public prices: PricesStore;
  public vaultDetail: VaultDetailStore;
  public vaultCharts: VaultChartsStore;
  public lockedCvxDelegation: LockedCvxDelegationStore;
  public gasPrices: GasPricesStore;
  public governancePortal: GovernancePortalStore;
  public lockedDeposits: LockedDepositsStore;

  // New Stores
  public tree: TreeStore;

  constructor() {
    this.sdk = new BadgerSDK({
      network: defaultNetwork.id,
      provider: rpc[defaultNetwork.symbol],
      baseURL: BADGER_API,
    });
    this.api = new BadgerAPI({
      network: defaultNetwork.id,
      baseURL: BADGER_API,
    });
    const config = getNetworkConfig(defaultNetwork.id);
    this.router = new RouterStore<RootStore>(this);
    this.network = new NetworkStore(this);
    this.wallet = new WalletStore(this, config);
    this.prices = new PricesStore(this);
    this.rebase = new RebaseStore(this);
    this.uiState = new UiStateStore(this);
    this.vaults = new VaultStore(this);
    this.user = new UserStore(this);
    this.vaultDetail = new VaultDetailStore(this);
    this.vaultCharts = new VaultChartsStore(this);
    this.lockedCvxDelegation = new LockedCvxDelegationStore(this);
    this.gasPrices = new GasPricesStore(this);
    // this.ibBTCStore = new IbBTCStore(this);
    this.governancePortal = new GovernancePortalStore();
    this.lockedDeposits = new LockedDepositsStore(this);

    // new stores
    this.tree = new TreeStore(this);

    makeObservable(this, {
      sdk: observable,
      updateNetwork: action,
      updateProvider: action,
    });
  }

  async updateNetwork(network: number): Promise<void> {
    const appNetwork = Network.networkFromId(network);

    // push network state to app
    if (this.network.network.id !== network) {
      this.network.network = appNetwork;
    }

    this.api = new BadgerAPI({
      network,
      baseURL: BADGER_API,
    });

    this.tree.reset();

    const refreshData = [
      this.network.updateGasPrices(),
      this.vaults.refresh(),
      this.prices.loadPrices(),
    ];

    await Promise.all(refreshData);
  }

  async updateProvider(provider: SDKProvider): Promise<void> {
    this.tree.reset();
    const { network } = this.network;

    this.sdk = new BadgerSDK({
      network: network.id,
      provider,
      baseURL: BADGER_API,
    });
    await this.sdk.ready();

    const { signer, address } = this.sdk;

    if (signer && address) {
      const updateActions = [];

      if (this.sdk.rewards.hasBadgerTree()) {
        updateActions.push(this.tree.loadBadgerTree());
      }

      updateActions.push(this.user.reloadBalances());

      // this.lockedDeposits.loadLockedBalances(),

      if (network.id === NETWORK_IDS.ETH || network.id === NETWORK_IDS.LOCAL) {
        // handle per page reloads, when init route is skipped
        // if (this.router.currentRoute?.path === routes.IbBTC.path) {
        // 	updateActions.push(this.ibBTCStore.init());
        // }

        updateActions.push(this.rebase.fetchRebaseStats());
      }

      await Promise.all(updateActions);
    }
  }
}

const store = new RootStore();

export default store;
