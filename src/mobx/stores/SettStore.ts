import { extendObservable, action, observe, IValueDidChange } from 'mobx';
import slugify from 'slugify';
import { RootStore } from '../RootStore';
import Web3 from 'web3';
import { Token } from 'mobx/model/tokens/token';
import { TokenCache } from '../model/tokens/token-cache';
import { SettCache } from '../model/setts/sett-cache';
import { ProtocolSummaryCache } from '../model/system-config/protocol-summary-cache';
import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { SettMap } from '../model/setts/sett-map';
import { TokenBalances } from 'mobx/model/account/user-balances';
import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { getToken } from 'web3/config/token-config';
import { Currency, Network, ProtocolSummary, Sett, SettState } from '@badger-dao/sdk';
import { SlugCache } from '../model/setts/slug-cache';
import { parseCallReturnContext } from '../utils/multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';

const formatSettListItem = (sett: Sett): [string, string] => {
	const sanitizedSettName = sett.name.replace(/\/+/g, '-'); // replace "/" with "-"
	return [sett.settToken, slugify(sanitizedSettName, { lower: true })];
};

export default class SettStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private tokenCache: TokenCache;
	private settCache: SettCache;
	private slugCache: SlugCache;
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

		this.tokenCache = {};
		this.settCache = {};
		this.slugCache = {};
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

	getSlug(address: string): string {
		const { network: currentNetwork } = this.store.network;

		return this.slugCache[currentNetwork.symbol][address];
	}

	getSett(address: string): Sett | undefined {
		if (!this.settMap) {
			return;
		}

		return this.settMap[Web3.utils.toChecksumAddress(address)];
	}

	getSettBySlug(slug: string): Sett | undefined | null {
		const { network: currentNetwork } = this.store.network;

		if (!this.settMap) {
			return undefined;
		}

		const settBySlug = Object.entries(this.slugCache[currentNetwork.symbol]).find(
			({ 1: cachedSlug }) => cachedSlug === slug,
		);

		if (!settBySlug) {
			return null;
		}

		return this.getSett(settBySlug[0]);
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

	async refresh(): Promise<void> {
		const { network } = this.store.network;
		if (network) {
			this.initialized = false;
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
		async (chain = Network.Ethereum): Promise<void> => {
			const settList = await this.store.api.loadSetts(Currency.ETH);

			if (settList) {
				this.settCache[chain] = Object.fromEntries(settList.map((sett) => [sett.settToken, sett]));

				this.slugCache[chain] = {
					...this.slugCache[chain],
					...Object.fromEntries(settList.map(formatSettListItem)),
				};
			} else {
				this.settCache[chain] = null;
			}
		},
	);

	loadTokens = action(
		async (chain = Network.Ethereum): Promise<void> => {
			const tokenConfig = await this.store.api.loadTokens();
			if (tokenConfig) {
				this.tokenCache[chain] = tokenConfig;
			} else {
				this.tokenCache[chain] = null;
			}
		},
	);

	loadAssets = action(
		async (chain = Network.Ethereum): Promise<void> => {
			const protocolSummary = await this.store.api.loadProtocolSummary(Currency.ETH);
			if (protocolSummary) {
				this.protocolSummaryCache[chain] = protocolSummary;
			} else {
				this.protocolSummaryCache[chain] = null;
			}
		},
	);

	updateAvailableBalance = (returnContext: ContractCallReturnContext): void => {
		const { prices } = this.store;
		const settAddress = returnContext.originalContractCallContext.contractAddress;
		const sett = parseCallReturnContext(returnContext.callsReturnContext);
		const balanceResults = sett.available;
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
