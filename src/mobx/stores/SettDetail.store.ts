import { Sett } from '../model/setts/sett';
import { RootStore } from '../RootStore';
import { action, extendObservable, observe } from 'mobx';
import { ContractNamespace } from '../../web3/config/contract-namespace';

export class SettDetailStore {
	private readonly store: RootStore;
	private searchSlug: string | undefined;
	private sett_: Sett | undefined | null;

	private comesFromPortfolioView = false;
	private shouldShowDepositDialog = false;
	private shouldShowWithdrawDialog = false;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			searchSlug: this.searchSlug,
			sett_: this.sett_,
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
		return this.sett_;
	}

	get isLoading(): boolean {
		return this.sett_ === undefined;
	}

	get isNotFound(): boolean {
		return this.sett_ === null;
	}

	get isDepositDialogDisplayed(): boolean {
		return this.shouldShowDepositDialog;
	}

	get isWithdrawDialogDisplayed(): boolean {
		return this.shouldShowWithdrawDialog;
	}

	get canUserWithdraw(): boolean {
		const { network, user } = this.store;

		if (!this.sett_) {
			return false;
		}

		const badgerSett = network.network.setts.find(
			({ vaultToken }) => vaultToken.address === this.sett_?.vaultToken,
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
		this.sett_ = undefined;
		this.searchSlug = undefined;
		this.comesFromPortfolioView = false;
	});

	private searchSlugInformation() {
		const { setts } = this.store;

		if (this.searchSlug && setts.initialized) {
			this.sett_ = setts.getSettBySlug(this.searchSlug);
		}
	}
}
