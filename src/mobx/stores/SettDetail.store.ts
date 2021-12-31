import { RootStore } from '../RootStore';
import { action, extendObservable, observe } from 'mobx';
import { BalanceNamespace } from 'web3/config/namespaces';
import { Vault } from '@badger-dao/sdk';

export class SettDetailStore {
  private readonly store: RootStore;
  private searchSlug: string | undefined;
  private searchedSett: Vault | undefined | null;

  private comesFromPortfolioView = false;
  private shouldShowDepositDialog = false;
  private shouldShowWithdrawDialog = false;

  constructor(store: RootStore) {
    this.store = store;

    extendObservable(this, {
      searchSlug: this.searchSlug,
      searchedSett: this.searchedSett,
      comesFromPortfolioView: this.comesFromPortfolioView,
      shouldShowDepositDialog: this.shouldShowDepositDialog,
      shouldShowWithdrawDialog: this.shouldShowWithdrawDialog,
    });

    observe(store.network, 'network', () => {
      this.searchSlugInformation();
    });

    observe(store.setts, 'initialized', () => {
      this.searchSlugInformation();
    });
  }

  get shouldShowDirectAccountInformation(): boolean {
    return this.comesFromPortfolioView;
  }

  get sett(): Vault | undefined | null {
    return this.searchedSett;
  }

  get isLoading(): boolean {
    return this.searchedSett === undefined;
  }

  get isNotFound(): boolean {
    return this.searchedSett === null;
  }

  get isDepositDialogDisplayed(): boolean {
    return this.shouldShowDepositDialog;
  }

  get isWithdrawDialogDisplayed(): boolean {
    return this.shouldShowWithdrawDialog;
  }

  get canUserWithdraw(): boolean {
    if (!this.searchedSett) {
      return false;
    }
    const { network } = this.store.network;
    const settToken = this.searchedSett.vaultToken;
    const sett = network.setts.find((s) => s.vaultToken.address === settToken);

    if (!sett) {
      return false;
    }

    const openBalance = this.store.user.getBalance(BalanceNamespace.Sett, sett).balance;
    const guardedBalance = this.store.user.getBalance(BalanceNamespace.GuardedSett, sett).balance;

    return openBalance.plus(guardedBalance).gt(0);
  }

  get canUserDeposit(): boolean {
    return this.store.onboard.isActive();
  }

  toggleDepositDialog(): void {
    this.shouldShowDepositDialog = !this.shouldShowDepositDialog;
  }

  toggleWithdrawDialog(): void {
    this.shouldShowWithdrawDialog = !this.shouldShowWithdrawDialog;
  }

  setAccountViewMode(): void {
    this.comesFromPortfolioView = true;
  }

  setSearchSlug = action((slug: string) => {
    this.searchSlug = slug;
    this.searchSlugInformation();
  });

  reset = action(() => {
    this.searchedSett = undefined;
    this.searchSlug = undefined;
    this.comesFromPortfolioView = false;
  });

  private searchSlugInformation() {
    const { setts } = this.store;

    if (this.searchSlug && setts.initialized) {
      this.searchedSett = setts.getSettBySlug(this.searchSlug);
    }
  }
}
