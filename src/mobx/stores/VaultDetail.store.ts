import { VaultDTOV3 } from '@badger-dao/sdk';
import { action, extendObservable, observe } from 'mobx';

import { RootStore } from './RootStore';

export class VaultDetailStore {
  private readonly store: RootStore;
  private searchSlug: string | undefined;
  private searchedVault: VaultDTOV3 | undefined | null;

  private comesFromPortfolioView = false;
  private shouldShowDepositDialog = false;
  private shouldShowWithdrawDialog = false;

  constructor(store: RootStore) {
    this.store = store;

    extendObservable(this, {
      searchSlug: this.searchSlug,
      searchedVault: this.searchedVault,
      comesFromPortfolioView: this.comesFromPortfolioView,
      shouldShowDepositDialog: this.shouldShowDepositDialog,
      shouldShowWithdrawDialog: this.shouldShowWithdrawDialog,
    });

    observe(store.chain, 'network', () => {
      this.searchSlugInformation();
    });

    observe(store.vaults, 'initialized', () => {
      this.searchSlugInformation();
    });
  }

  get vault(): VaultDTOV3 | undefined | null {
    return this.searchedVault;
  }

  get isLoading(): boolean {
    return this.searchedVault === undefined;
  }

  get isNotFound(): boolean {
    return this.searchedVault === null;
  }

  get isDepositDialogDisplayed(): boolean {
    return this.shouldShowDepositDialog;
  }

  get isWithdrawDialogDisplayed(): boolean {
    return this.shouldShowWithdrawDialog;
  }

  toggleDepositDialog(): void {
    this.shouldShowDepositDialog = !this.shouldShowDepositDialog;
  }

  toggleWithdrawDialog(): void {
    this.shouldShowWithdrawDialog = !this.shouldShowWithdrawDialog;
  }

  setSearchSlug = action((slug: string) => {
    this.searchSlug = slug;
    this.searchSlugInformation();
  });

  reset = action(() => {
    this.searchedVault = undefined;
    this.searchSlug = undefined;
    this.comesFromPortfolioView = false;
  });

  private searchSlugInformation() {
    const { vaults } = this.store;

    if (this.searchSlug && vaults.initialized) {
      this.searchedVault = vaults.getVaultBySlug(this.searchSlug);
    }
  }
}
