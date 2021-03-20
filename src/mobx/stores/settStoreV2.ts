import { extendObservable, action } from 'mobx';
import { RootStore } from '../store';
import { getTokenPrices, getTotalValueLocked, listGeysers, listSetts } from 'mobx/utils/apiV2';
import { PriceSummary, Sett, ProtocolSummary, Network, keyedSettList } from 'mobx/model';
import Web3 from 'web3';
import { NETWORK_CONSTANTS, NETWORK_LIST } from 'config/constants';

export default class SettStoreV2 {
	private store!: RootStore;
	private network!: Network;

	// loading: undefined, error: null, present: object
	public settList: Sett[] | undefined | null;
	public priceData: PriceSummary | undefined | null;
	public protocolSummary: ProtocolSummary | undefined | null;
	public badger: number | undefined | null;
	public farmData: any;
	public keyedSettList: keyedSettList | undefined | null;

	constructor(store: RootStore) {
		this.store = store;
		this.network = this.store.wallet.network;

		extendObservable(this, {
			settList: undefined,
			priceData: undefined,
			assets: undefined,
			badger: undefined,
			farmData: undefined,
			keyedSettList: undefined,
		});

		this.settList = undefined;
		this.priceData = undefined;
		this.protocolSummary = undefined;
		this.badger = undefined;
		this.farmData = undefined;
		this.keyedSettList = undefined;

		this.init();
	}

	init = action(
		async (): Promise<void> => {
			if (this.network.name === NETWORK_LIST.ETH) {
				this.loadGeysers(this.network.name);
			} else {
				this.loadSetts(this.network.name);
			}
			this.loadAssets(this.network.name);
			this.loadPrices();
			this.loadBadger();
		},
	);

	loadSetts = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listSetts(chain);
			this.keyedSettList = this.keySettByContract(this.settList);
		},
	);

	loadGeysers = action(
		async (chain?: string): Promise<void> => {
			this.settList = await listGeysers(chain);
			this.farmData = this.keySettByAsset(this.settList);
			this.keyedSettList = this.keySettByContract(this.settList);
		},
	);

	loadPrices = action(
		async (currency?: string, network?: string): Promise<void> => {
			this.priceData = await getTokenPrices(currency, network);
		},
	);

	loadBadger = action(
		async (): Promise<void> => {
			const response = await getTokenPrices('usd', 'eth');
			this.badger = response![NETWORK_CONSTANTS[NETWORK_LIST.ETH].DEPLOY!.token];
		},
	);

	loadAssets = action(
		async (chain?: string): Promise<void> => {
			this.protocolSummary = await getTotalValueLocked(chain);
		},
	);

	// HELPERS
	// Input: Array of Sett objects
	// Output: Object keyed by the asset name to lower case
	keySettByAsset = action((settList: Sett[] | undefined | null): { [geyser: string]: Sett } => {
		const map: { [geyser: string]: Sett } = {};
		if (settList) {
			settList.forEach((sett) => (map[sett.vaultToken] = sett));
		}
		return map;
	});

	// Input: Array of Sett objects
	// Output: Object keyed by the sett contract
	keySettByContract = action((settList: Sett[] | null) => {
		var mappedList: { [x: string]: Sett } = {};
		settList!.forEach((sett) => (mappedList[sett.vaultToken] = sett));
		return mappedList;
	});
}
