import { Sett } from '../model/setts/sett';
import { RootStore } from '../RootStore';
import { action, extendObservable, observe } from 'mobx';

export class SettDetailStore {
	private readonly store: RootStore;
	private searchSlug: string | undefined;
	private sett_: Sett | undefined | null;
	private comesFromPortfolioView = false;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			searchSlug: this.searchSlug,
			sett_: this.sett_,
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
