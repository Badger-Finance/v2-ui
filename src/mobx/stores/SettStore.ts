import { extendObservable, action, observe, IValueDidChange } from 'mobx';
import { RootStore } from '../store';
import { getTokens, getTotalValueLocked, listSetts } from 'mobx/utils/apiV2';
import { NETWORK_LIST } from 'config/constants';
import Web3 from 'web3';
import WalletStore from './walletStore';
import { Token } from 'mobx/model/tokens/token';
import { TokenCache } from '../model/tokens/token-cache';
import { SettCache } from '../model/setts/sett-cache';
import { ProtocolSummaryCache } from '../model/system-config/protocol-summary-cache';
import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { SettState } from '../model/setts/sett-state';
import { Sett } from '../model/setts/sett';
import { SettMap } from '../model/setts/sett-map';
import { ProtocolSummary } from '../model/system-config/protocol-summary';

export default class SettStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private tokenCache: TokenCache;
	private settCache: SettCache;
	private protocolSummaryCache: ProtocolSummaryCache;
	public initialized: boolean;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			tokenCache: undefined,
			protocolSummaryCache: undefined,
			settCache: undefined,
			priceCache: undefined,
		});

		observe(this.store.wallet, 'currentBlock', async (change: IValueDidChange<number | undefined>) => {
			if (change.oldValue !== change.newValue) {
				this.refresh();
			}
		});

		/**
		 * Update account store on change of network.
		 */
		observe(this.store.wallet as WalletStore, 'network', () => {
			this.initialized = false;
			this.refresh();
		});

		this.tokenCache = {};
		this.settCache = {};
		this.protocolSummaryCache = {};
		this.initialized = false;

		this.refresh();
	}

	get settMap(): SettMap | undefined | null {
		return this.settCache[this.store.wallet.network.name];
	}

	get protocolSummary(): ProtocolSummary | undefined | null {
		return this.protocolSummaryCache[this.store.wallet.network.name];
	}

	get tokenConfig(): TokenConfigRecord | undefined | null {
		return this.tokenCache[this.store.wallet.network.name];
	}

	getSett(address: string): Sett | undefined {
		if (!this.settMap) {
			return;
		}
		return this.settMap[Web3.utils.toChecksumAddress(address)];
	}

	getSettMap(state: SettState): SettMap | undefined | null {
		const network = this.store.wallet.network;
		const setts = this.settCache[network.name];
		if (!setts) {
			return setts;
		}
		return Object.fromEntries(Object.entries(setts).filter((entry) => entry[1].state === state));
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
			this.store.user.refreshBalances();
		}
	}

	loadSetts = action(
		async (chain?: string): Promise<void> => {
			chain = chain ?? NETWORK_LIST.ETH;
			const settList = await listSetts(chain);
			if (settList) {
				this.settCache[chain] = Object.fromEntries(settList.map((sett) => [sett.vaultToken, sett]));
			} else {
				this.settCache[chain] = null;
			}
		},
	);

	loadTokens = action(
		async (chain?: string): Promise<void> => {
			chain = chain ?? NETWORK_LIST.ETH;
			const tokenConfig = await getTokens(chain);
			if (tokenConfig) {
				this.tokenCache[chain] = tokenConfig;
			} else {
				this.tokenCache[chain] = null;
			}
		},
	);

	loadAssets = action(
		async (chain?: string): Promise<void> => {
			chain = chain ?? NETWORK_LIST.ETH;
			const protocolSummary = await getTotalValueLocked(chain);
			if (protocolSummary) {
				this.protocolSummaryCache[chain] = protocolSummary;
			} else {
				this.protocolSummaryCache[chain] = null;
			}
		},
	);
}
