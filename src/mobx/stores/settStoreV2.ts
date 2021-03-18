import { extendObservable, action } from 'mobx';
import { RootStore } from '../store';
import { getTokenPrices, listGeysers, listSetts } from 'mobx/utils/apiV2';
import { PriceSummary, Sett } from 'mobx/model';
import Web3 from 'web3';

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

		this.init();
	}

	init = action(
		async (): Promise<void> => {
			this.loadSetts(this.store.wallet.network.name);
		},
	);

	loadSetts = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listSetts(chain);
			this.settList?.map((sett) => {
				if (
					sett.vaultToken === '0xF6BC36280F32398A031A7294e81131aEE787D178' &&
					process.env.NODE_ENV !== 'production'
				)
					sett.vaultToken = '0x34769B18279800d5598A101A93A34CfE86bd6694';
				sett.vaultToken = Web3.utils.toChecksumAddress(sett.vaultToken);
			});
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
