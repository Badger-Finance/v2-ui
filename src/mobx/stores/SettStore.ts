import { extendObservable, action, observe, IValueDidChange } from 'mobx';
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

		observe(this.store.wallet, 'currentBlock', async (change: IValueDidChange<number | undefined>) => {
			if (change.oldValue !== change.newValue) {
				this.refresh();
			}
		});

		this.settCache = {};
		this.settMapCache = {};
		this.experimentalMapCache = {};
		this.protocolSummaryCache = {};
		this.priceCache = {};

		this.refresh();
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

	getPrice(address: string): BigNumber {
		return this.priceCache[Web3.utils.toChecksumAddress(address)] ?? new BigNumber(0);
	}

	getSett(address: string): Sett | undefined {
		const settMap: SettMap = {
			...this.settMap,
			...this.experimentalMap,
		};
		return settMap[Web3.utils.toChecksumAddress(address)];
	}

	private refresh(): void {
		const network = this.store.wallet.network;
		if (network) {
			this.loadSetts(network.name);
			this.loadPrices(network.name);
			this.loadAssets(network.name);
		}
	}

	loadSetts = action(
		async (chain?: string): Promise<void> => {
			chain = chain ?? NETWORK_LIST.ETH;
			const settList = await listSetts(chain);
			if (settList) {
				this.settCache[chain] = settList;
				[this.settMapCache[chain], this.experimentalMapCache[chain]] = this.keySettByContract(settList);
			}
		},
	);

	loadPrices = action(
		async (network?: string): Promise<void> => {
			const prices = await getTokenPrices(network);
			if (prices) {
				Object.entries(prices).forEach((entry) => {
					const [key, value] = entry;
					prices[key] = new BigNumber(value);
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
