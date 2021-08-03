import { Sett } from '../model/setts/sett';
import { RootStore } from '../RootStore';
import { action, extendObservable, observe } from 'mobx';

export class SettDetailStore {
	private readonly store: RootStore;
	private searchSlug: string | undefined;
	private sett_: Sett | undefined | null; // undefined means loading while null means not found

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			searchSlug: this.searchSlug,
			sett_: this.sett_,
		});

		observe(store.setts, 'initialized', () => {
			this.searchSlugInformation();
		});
	}

	get sett(): Sett | undefined | null {
		return this.sett_;
	}

	setSearchSlug = action((slug: string) => {
		this.searchSlug = slug;
		this.searchSlugInformation();
	});

	reset = action(() => {
		this.sett_ = undefined;
		this.searchSlug = undefined;
	});

	private searchSlugInformation() {
		const { setts } = this.store;

		if (this.searchSlug && setts.initialized) {
			this.sett_ = setts.getSettBySlug(this.searchSlug);
		}
	}
}
