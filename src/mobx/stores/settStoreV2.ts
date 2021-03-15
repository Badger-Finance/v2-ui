import { extendObservable, action } from 'mobx';
import { RootStore } from '../store';
import { getTokenPrices, listGeysers, listSetts } from 'mobx/utils/apiV2';
import { PriceSummary, Sett } from 'mobx/model';

export default class SettStoreV2 {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	public settList: Sett[] | undefined | null;
	public priceData: PriceSummary | undefined | null;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			settList: undefined,
			priceData: undefined,
		});

		this.settList = undefined;
		this.priceData = undefined;
	}

	init = action(
		async (): Promise<void> => {
			this.loadSetts();
		},
	);

	loadSetts = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listSetts(chain);
		},
	);

	loadGeysers = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listGeysers(chain);
		},
	);

	loadPrices = action(
		async (currency?: string): Promise<void> => {
			this.priceData = await getTokenPrices(currency);
		},
	);
}
