import { Sett } from '../model/setts/sett';
import { RootStore } from '../RootStore';
import { action, extendObservable, observe } from 'mobx';
import { ContractNamespace } from '../../web3/config/contract-namespace';

export class SettDetailStore {
	private readonly store: RootStore;
	private searchSlug: string | undefined;
	private searchedSett: Sett | undefined | null;

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

	get sett(): Sett | undefined | null {
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

		const { network, user } = this.store;
		const badgerSett = network.network.setts.find(
			({ vaultToken }) => vaultToken.address === this.searchedSett?.vaultToken,
		);

		if (!badgerSett) {
			return false;
		}

		return user.getBalance(ContractNamespace.Sett, badgerSett).balance.gt(0);
	}

	get canUserDeposit(): boolean {
		return !!this.store.wallet.connectedAddress;
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
