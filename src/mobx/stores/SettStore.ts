import { extendObservable, action, observe, IValueDidChange } from 'mobx';
import slugify from 'slugify';
import { RootStore } from '../RootStore';
import { getTokens, getTotalValueLocked, listSetts } from 'mobx/utils/apiV2';
import Web3 from 'web3';
import { Token } from 'mobx/model/tokens/token';
import { TokenCache } from '../model/tokens/token-cache';
import { SettCache } from '../model/setts/sett-cache';
import { ProtocolSummaryCache } from '../model/system-config/protocol-summary-cache';
import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { SettState } from '../model/setts/sett-state';
import { Sett } from '../model/setts/sett';
import { SettMap } from '../model/setts/sett-map';
import { ProtocolSummary } from '../model/system-config/protocol-summary';
import { NetworkStore } from './NetworkStore';
import { ChainNetwork } from '../../config/enums/chain-network.enum';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { CallResult } from 'web3/interface/call-result';
import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { getToken } from 'web3/config/token-config';

const formatSettListItem = (sett: Sett): [string, Sett] => {
	const sanitizedSettName = sett.name.replace(/\/+/g, '-'); // replace "/" with "-"
	return [sett.vaultToken, { ...sett, slug: slugify(sanitizedSettName, { lower: true }) }];
};

export default class SettStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private tokenCache: TokenCache;
	private settCache: SettCache;
	private protocolSummaryCache: ProtocolSummaryCache;
	public initialized: boolean;
	public availableBalances: TokenBalances = {};

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			tokenCache: undefined,
			protocolSummaryCache: undefined,
			settCache: undefined,
			priceCache: undefined,
			initialized: false,
			availableBalances: this.availableBalances,
		});

		observe(this.store.network, 'currentBlock', async (change: IValueDidChange<number | undefined>) => {
			if (change.oldValue !== change.newValue) {
				this.refresh();
			}
		});

		/**
		 * Update account store on change of network.
		 */
		observe(this.store.network as NetworkStore, 'network', () => {
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
		return this.settCache[this.store.network.network.symbol];
	}

	get protocolSummary(): ProtocolSummary | undefined | null {
		return this.protocolSummaryCache[this.store.network.network.symbol];
	}

	get tokenConfig(): TokenConfigRecord | undefined | null {
		return this.tokenCache[this.store.network.network.symbol];
	}

	getSett(address: string): Sett | undefined {
		if (!this.settMap) {
			return;
		}
		return this.settMap[Web3.utils.toChecksumAddress(address)];
	}

	getSettBySlug(slug: string): Sett | undefined | null {
		if (!this.settMap) {
			return undefined;
		}

		const settBySlug = Object.values(this.settMap).find((sett) => sett.slug === slug);

		if (!settBySlug) {
			return null;
		}

		return settBySlug;
	}

	getSettMap(state: SettState): SettMap | undefined | null {
		const { network } = this.store.network;
		const setts = this.settCache[network.symbol];
		if (!setts) {
			return setts;
		}
		return Object.fromEntries(Object.entries(setts).filter((entry) => entry[1].state === state));
	}

	getToken(address: string): Token | undefined {
		const { network } = this.store.network;
		const tokens = this.tokenCache[network.symbol];
		const tokenAddress = Web3.utils.toChecksumAddress(address);
		if (!tokens || !tokens[tokenAddress]) {
			return;
		}
		return tokens[tokenAddress];
	}

	private async refresh(): Promise<void> {
		const { network } = this.store.network;
		if (network) {
			await Promise.all([
				this.loadSetts(network.symbol),
				this.loadTokens(network.symbol),
				this.loadAssets(network.symbol),
			]);
			this.initialized = true;
			this.store.user.refreshBalances();
		}
	}

	loadSetts = action(
		async (chain = ChainNetwork.Ethereum): Promise<void> => {
			const settList = await listSetts(chain);

			if (settList) {
				this.settCache[chain] = Object.fromEntries(settList.map(formatSettListItem));
			} else {
				this.settCache[chain] = null;
			}
		},
	);

	loadTokens = action(
		async (chain = ChainNetwork.Ethereum): Promise<void> => {
			const tokenConfig = await getTokens(chain);
			if (tokenConfig) {
				this.tokenCache[chain] = tokenConfig;
			} else {
				this.tokenCache[chain] = null;
			}
		},
	);

	loadAssets = action(
		async (chain = ChainNetwork.Ethereum): Promise<void> => {
			const protocolSummary = await getTotalValueLocked(chain);

			if (protocolSummary) {
				this.protocolSummaryCache[chain] = protocolSummary;
			} else {
				this.protocolSummaryCache[chain] = null;
			}
		},
	);

	updateAvailableBalance = (sett: CallResult): void => {
		const { prices } = this.store;
		const balanceResults = sett.available;
		const settAddress = sett.address;
		if (!balanceResults || balanceResults.length === 0 || !settAddress) {
			return;
		}
		const settToken = getToken(settAddress);
		if (!settToken) {
			return;
		}
		const balance = new BigNumber(balanceResults[0].value);
		if (!balance || balance.isNaN()) {
			return;
		}
		const tokenPrice = prices.getPrice(settAddress);
		const key = Web3.utils.toChecksumAddress(settAddress);
		this.availableBalances[key] = new TokenBalance(settToken, balance, tokenPrice);
	};
}
