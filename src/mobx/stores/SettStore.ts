import { extendObservable, action, observe, IValueDidChange } from 'mobx';
import { RootStore } from '../store';
import { getTokens, getTotalValueLocked, listSetts } from 'mobx/utils/apiV2';
import { Sett, ProtocolSummary, SettMap } from 'mobx/model';
import { NETWORK_LIST } from 'config/constants';
import Web3 from 'web3';
import WalletStore from './walletStore';
import { TokenConfig } from 'mobx/model/token-config';
import { Token } from 'mobx/model/token';

export default class SettStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private settCache: { [chain: string]: Sett[] | undefined | null };
	private tokenCache: { [chain: string]: TokenConfig | undefined | null };
	private settMapCache: { [chain: string]: SettMap | undefined | null };
	private experimentalMapCache: { [chain: string]: SettMap | undefined | null };
	private protocolSummaryCache: { [chain: string]: ProtocolSummary | undefined | null };
	public initialized: boolean;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			settCache: undefined,
			tokenCache: undefined,
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

		/**
		 * Update user store on change of network.
		 */
		observe(this.store.wallet as WalletStore, 'network', () => {
			this.initialized = false;
			this.refresh();
		});

		this.settCache = {};
		this.tokenCache = {};
		this.settMapCache = {};
		this.experimentalMapCache = {};
		this.protocolSummaryCache = {};
		this.initialized = false;

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

	getSett(address: string): Sett | undefined {
		const settMap: SettMap = {
			...this.settMap,
			...this.experimentalMap,
		};
		return settMap[Web3.utils.toChecksumAddress(address)];
	}

	getToken(address: string): Token | undefined {
		const network = this.store.wallet.network;
		const tokens = this.tokenCache[network.name];
		const tokenAddress = Web3.utils.toChecksumAddress(address);
		if (!tokens || !tokens[tokenAddress]) {
			return;
		}
		return tokens[tokenAddress];
	}

	private async refresh(): Promise<void> {
		const network = this.store.wallet.network;
		if (network) {
			await Promise.all([
				this.loadSetts(network.name),
				this.loadTokens(network.name),
				this.loadAssets(network.name),
			]);
			this.initialized = true;
			this.store.user.refresh();
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

	loadTokens = action(
		async (chain?: string): Promise<void> => {
			chain = chain ?? NETWORK_LIST.ETH;
			const tokenConfig = await getTokens(chain);
			if (tokenConfig) {
				this.tokenCache[chain] = tokenConfig;
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
