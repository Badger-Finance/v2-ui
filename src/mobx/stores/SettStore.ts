import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../store';
import { getTokenPrices, getTotalValueLocked, listSetts } from 'mobx/utils/apiV2';
import { PriceSummary, Sett, ProtocolSummary, SettMap } from 'mobx/model';
import { NETWORK_LIST } from 'config/constants';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';

export default class SettStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private settCache: { [chain: string]: Sett[] | undefined | null };
	private settMapCache: { [chain: string]: SettMap | undefined | null };
	private experimentalMapCache: { [chain: string]: SettMap | undefined | null };
	private protocolSummaryCache: { [chain: string]: ProtocolSummary | undefined | null };
	private priceCache: PriceSummary;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			settCache: undefined,
			protocolSummaryCache: undefined,
			settMapCache: undefined,
			experimentalMapCache: undefined,
			priceCache: undefined,
		});

		observe(this.store.wallet, 'currentBlock', async (change: any) => {
			if (!!change.oldValue) {
				await this.loadPrices();
				await this.loadAssets();
				await this.loadSetts();
			}
		});

		this.settCache = {};
		this.settMapCache = {};
		this.experimentalMapCache = {};
		this.protocolSummaryCache = {};
		this.priceCache = {};
	}

	get settList(): Sett[] | undefined | null {
		return this.settCache[this.store.wallet.network.name];
	}

	get settMap(): SettMap | undefined | null {
		return this.settMapCache[this.store.wallet.network.name];
	}

	get experimentalMap(): SettMap | undefined | null {
		return this.experimentalMapCache[this.store.wallet.network.name];
	}

	get protocolSummary(): ProtocolSummary | undefined | null {
		return this.protocolSummaryCache[this.store.wallet.network.name];
	}

	getPrice(address: string): BigNumber | undefined {
		return this.priceCache[Web3.utils.toChecksumAddress(address)] ?? undefined;
	}

	loadSetts = action(async (chain?: string): Promise<void> => this.loadSettList(listSetts, chain));

	loadSettList = action(async (load: (chain?: string) => Promise<Sett[] | null>, chain?: string) => {
		// load interface, or display loading
		chain = chain ?? NETWORK_LIST.ETH;
		const settList = await load(chain);
		if (settList) {
			settList.forEach((sett) => {
				// TODO: remove fill-ins once api + ui is upgraded in tandem
				if (sett.apy) {
					sett.apr = sett.apy;
				}
				sett.sources.forEach((source) => {
					if (source.apy) {
						source.apr = source.apy;
					}
				});
			});
			this.settCache[chain] = settList;
			[this.settMapCache[chain], this.experimentalMapCache[chain]] = this.keySettByContract(settList);
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
	// Output: Objects keyed by the sett address and experimental flag
	keySettByContract = action((settList: Sett[] | undefined | null): { [geyser: string]: Sett }[] => {
		const map: { [geyser: string]: Sett } = {};
		const experimentalMap: { [geyser: string]: Sett } = {};
		if (settList) {
			settList.forEach((sett) =>
				sett.experimental ? (experimentalMap[sett.vaultToken] = sett) : (map[sett.vaultToken] = sett),
			);
		}
		return [map, experimentalMap];
	});
}
