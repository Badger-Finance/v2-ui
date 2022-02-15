import { RootStore } from '../RootStore';
import { action, extendObservable, observe } from 'mobx';
import { BalanceNamespace } from 'web3/config/namespaces';
import { Vault } from '@badger-dao/sdk';

export class VaultDetailStore {
	private readonly store: RootStore;
	private searchSlug: string | undefined;
	private searchedVault: Vault | undefined | null;

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

		observe(store.network, 'network', () => {
			this.searchSlugInformation();
		});

		observe(store.vaults, 'initialized', () => {
			this.searchSlugInformation();
		});
	}

	get shouldShowDirectAccountInformation(): boolean {
		return this.comesFromPortfolioView;
	}

	get vault(): Vault | undefined | null {
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

	get canUserWithdraw(): boolean {
		if (!this.searchedVault) {
			return false;
		}
		const vault = this.store.vaults.getVault(this.searchedVault.vaultToken);
		const vaultDefinition = vault ? this.store.vaults.getVaultDefinition(vault) : undefined;

		if (!vaultDefinition) {
			return false;
		}

		const openBalance = this.store.user.getBalance(BalanceNamespace.Vault, vaultDefinition).balance;
		const guardedBalance = this.store.user.getBalance(BalanceNamespace.GuardedVault, vaultDefinition).balance;

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
