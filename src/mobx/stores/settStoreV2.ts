import { extendObservable, action } from 'mobx';
import { RootStore } from '../store';
import { getTokenPrices, getTotalValueLocked, listGeysers, listSetts, getCoinData } from 'mobx/utils/apiV2';
import { PriceSummary, Sett, TvlSummary } from 'mobx/model';
import Web3 from 'web3';
import { NETWORK_LIST } from 'config/constants';

export default class SettStoreV2 {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	public settList: Sett[] | undefined | null;
	public priceData: PriceSummary | undefined | null;
	public assets: TvlSummary | undefined | null;
	public badger: { [index: string]: any } | undefined | null;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			settList: undefined,
			priceData: undefined,
			assets: undefined,
			badger: undefined,
		});

		this.settList = undefined;
		this.priceData = undefined;
		this.assets = undefined;
		this.badger = undefined;

		this.init();
	}

	init = action(
		async (): Promise<void> => {
			if (this.store.wallet.network.name === NETWORK_LIST.ETH) this.loadGeysers(this.store.wallet.network.name);
			else this.loadSetts(this.store.wallet.network.name);
			this.loadAssets(this.store.wallet.network.name);
			this.loadBadgerPrice();
		},
	);

	loadSetts = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listSetts(chain);
			this.settList?.map((sett) => {
				//
				if (
					sett.vaultToken === '0xF6BC36280F32398A031A7294e81131aEE787D178' &&
					process.env.NODE_ENV !== 'production'
				)
					sett.vaultToken = '0x34769B18279800d5598A101A93A34CfE86bd6694';
				sett.vaultToken = Web3.utils.toChecksumAddress(sett.vaultToken);
			});
		},
	);

	loadBadgerPrice = action(() => {
		getCoinData('badger-dao').then((res: any) => {
			if (res) {
				this.badger = res;
			}
		});
	});

	loadGeysers = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listGeysers(chain);
		},
	);

	// TODO: Use this?
	loadPrices = action(
		async (currency?: string): Promise<void> => {
			this.priceData = await getTokenPrices(currency);
		},
	);

	loadAssets = action(
		async (chain?: string): Promise<void> => {
			this.assets = await getTotalValueLocked(chain);
		},
	);
}
