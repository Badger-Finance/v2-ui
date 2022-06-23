import { APP_NEWS_MESSAGE, APP_NEWS_STORAGE_HASH } from 'config/constants';
import { action, extendObservable } from 'mobx';

const SHOW_USER_BALANCE_KEY = 'showUserBalance';

class UiStateStore {
  public showWalletDrawer: boolean;
  public rewardsDialogOpen: boolean;
  public sidebarOpen!: boolean;
  public showUserBalances: boolean;
  public txStatus?: string;
  private showNotification: boolean;
  private showNetworkOptions: boolean;

  constructor() {
    const storedBalanceDisplay = window.localStorage.getItem(
      SHOW_USER_BALANCE_KEY,
    );
    this.showUserBalances = storedBalanceDisplay === 'true';

    this.showNotification = this.notificationClosingThreshold < 3;
    this.showWalletDrawer = false;
    this.showNetworkOptions = false;
    this.rewardsDialogOpen = false;

    extendObservable(this, {
      showNotification: this.showNotification,
      sidebarOpen: false,
      rewardsDialogOpen: false,
      showUserBalances: this.showUserBalances,
      txStatus: undefined,
      showWalletDrawer: this.showWalletDrawer,
      showNetworkOptions: this.showNetworkOptions,
    });

    if (APP_NEWS_STORAGE_HASH) {
      window.localStorage.setItem(
        APP_NEWS_STORAGE_HASH,
        String(this.notificationClosingThreshold + 1),
      );
    }
  }

  get areNetworkOptionsOpen() {
    return this.showNetworkOptions;
  }

  get notificationClosingThreshold(): number {
    return APP_NEWS_STORAGE_HASH
      ? Number(window.localStorage.getItem(APP_NEWS_STORAGE_HASH))
      : 0;
  }

  get shouldShowNotification(): boolean {
    if (!APP_NEWS_MESSAGE || this.notificationClosingThreshold > 3) {
      return false;
    }

    return this.showNotification;
  }

  /* Load Operations */

  closeNotification = action(() => {
    if (APP_NEWS_STORAGE_HASH) {
      this.showNotification = false;
    }
  });

  // TODO: this does nothing?
  setTxStatus = action((status?: string) => {
    this.txStatus = status;
  });

  setShowUserBalances = action((shouldShowUserBalance: boolean) => {
    window.localStorage.setItem(
      SHOW_USER_BALANCE_KEY,
      `${shouldShowUserBalance}`,
    );
    this.showUserBalances = shouldShowUserBalance;
  });

  openSidebar = action(() => {
    this.sidebarOpen = true;
  });

  closeSidebar = action(() => {
    this.sidebarOpen = false;
  });

  openNetworkOptions = action(() => {
    this.showNetworkOptions = true;
  });

  closeNetworkOptions = action(() => {
    this.showNetworkOptions = false;
  });

  toggleWalletDrawer = action(() => {
    this.showWalletDrawer = !this.showWalletDrawer;
  });

  openRewardsDialog = action(() => {
    this.rewardsDialogOpen = true;
  });

  toggleRewardsDialog = action(() => {
    this.rewardsDialogOpen = !this.rewardsDialogOpen;
  });
}

export default UiStateStore;
