import { extendObservable, action } from 'mobx';
import { RootStore } from '../store';
import { getTokenPrices, getTotalValueLocked, listGeysers, listSetts } from 'mobx/utils/apiV2';
import { PriceSummary, Sett, ProtocolSummary, SettMap } from 'mobx/model';
import { NETWORK_LIST } from 'config/constants';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

export default class SettStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private settCache: { [chain: string]: Sett[] | undefined | null };
	private settMapCache: { [chain: string]: SettMap | undefined | null };
	private protocolSummaryCache: { [chain: string]: ProtocolSummary | undefined | null };
	private priceCache: PriceSummary;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			settCache: undefined,
			protocolSummaryCache: undefined,
			settMapCache: undefined,
			priceCache: undefined,
		});

		this.settCache = {};
		this.settMapCache = {};
		this.protocolSummaryCache = {};
		this.priceCache = {};
	}

	get settList(): Sett[] | undefined | null {
		return this.settCache[this.store.wallet.network.name];
	}

	get settMap(): SettMap | undefined | null {
		return this.settMapCache[this.store.wallet.network.name];
	}

	get protocolSummary(): ProtocolSummary | undefined | null {
		return this.protocolSummaryCache[this.store.wallet.network.name];
	}

	getPrice(address: string): BigNumber | undefined {
		return this.priceCache[Web3.utils.toChecksumAddress(address)]
			? this.priceCache[Web3.utils.toChecksumAddress(address)]
			: undefined;
	}

	loadSetts = action(async (chain?: string): Promise<void> => this.loadSettList(listSetts, chain));
	loadGeysers = action(async (chain?: string): Promise<void> => this.loadSettList(listGeysers, chain));

	loadSettList = action(async (load: (chain?: string) => Promise<Sett[] | null>, chain?: string) => {
		// load interface, or display loading
		chain = chain ?? NETWORK_LIST.ETH;
		const settList = await load(chain);
		if (settList) {
			this.settCache[chain] = settList;
			this.settMapCache[chain] = this.keySettByContract(settList);
		}
	});

	loadPrices = action(
		async (network?: string): Promise<void> => {
			const prices = await getTokenPrices(network);
			if (prices) {
				Object.keys(prices).forEach((key) => {
					const value = prices[key];
					if (value) {
						prices[key] = new BigNumber(value).multipliedBy(1e18);
					}
				});
				this.priceCache = {
					...this.priceCache,
					...prices,
				};
			}
		},
	);

	loadAssets = action(
		async (chain?: string): Promise<void> => {
			chain = chain ?? NETWORK_LIST.ETH;
			const protocolSummary = await getTotalValueLocked(chain);
			if (protocolSummary) {
				this.protocolSummaryCache[chain] = protocolSummary;
			}
		},
	);

	// HELPERS
	// Input: Array of Sett objects
	// Output: Object keyed by the sett contract
	keySettByContract = action((settList: Sett[] | undefined | null): { [geyser: string]: Sett } => {
		const map: { [geyser: string]: Sett } = {};
		if (settList) {
			settList.forEach((sett) => (map[sett.vaultToken] = sett));
		}
		return map;
	});
}
