import { extendObservable, action } from 'mobx';
import slugify from 'slugify';
import { RootStore } from '../RootStore';
import Web3 from 'web3';
import { Token } from 'mobx/model/tokens/token';
import { TokenCache } from '../model/tokens/token-cache';
import { VaultCache } from '../model/vaults/vault-cache';
import { ProtocolSummaryCache } from '../model/system-config/protocol-summary-cache';
import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { VaultMap } from '../model/vaults/vault-map';
import { TokenBalances } from 'mobx/model/account/user-balances';
import BigNumber from 'bignumber.js';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { Currency, Network, ProtocolSummary, Vault, VaultState, TokenConfiguration } from '@badger-dao/sdk';
import { VaultSlugCache } from '../model/vaults/vault-slug-cache';
import { parseCallReturnContext } from '../utils/multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';

const formatVaultListItem = (vault: Vault): [string, string] => {
	const sanitizedVaultName = vault.name.replace(/\/+/g, '-'); // replace "/" with "-"
	return [vault.vaultToken, slugify(sanitizedVaultName, { lower: true })];
};

export default class VaultStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private tokenCache: TokenCache;
	private settCache: VaultCache;
	private slugCache: VaultSlugCache;
	private protocolSummaryCache: ProtocolSummaryCache;
	public protocolTokens: Set<string>;
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

		this.tokenCache = {};
		this.settCache = {};
		this.slugCache = {};
		this.protocolSummaryCache = {};
		this.protocolTokens = new Set();
		this.initialized = false;
		this.refresh();
	}

	get settMap(): VaultMap | undefined | null {
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

	getVault(address: string): Vault | undefined {
		if (!this.settMap) {
			return;
		}

		return this.settMap[Web3.utils.toChecksumAddress(address)];
	}

	getVaultBySlug(slug: string): Vault | undefined | null {
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

		return this.getVault(settBySlug[0]);
	}

	getVaultMapByState(state: VaultState): VaultMap | undefined | null {
		const setts = this.getVaultMap();
		if (!setts) {
			return setts;
		}
		return Object.fromEntries(Object.entries(setts).filter((entry) => entry[1].state === state));
	}

	getVaultMap(): VaultMap | undefined | null {
		const { network } = this.store.network;
		const setts = this.settCache[network.symbol];
		if (!setts) {
			return setts;
		}
		return setts;
	}

	getTokenConfigs(): TokenConfiguration {
		const { network } = this.store.network;
		const tokenConfig = this.tokenCache[network.symbol];
		if (!tokenConfig) {
			return {};
		}
		return tokenConfig;
	}

	getToken(address: string): Token {
		const { network } = this.store.network;
		const tokens = this.tokenCache[network.symbol];
		const tokenAddress = Web3.utils.toChecksumAddress(address);
		if (!tokens || !tokens[tokenAddress]) {
			return {
				name: '',
				address,
				decimals: 18,
				symbol: '',
			};
		}
		return tokens[tokenAddress];
	}

	async refresh(): Promise<void> {
		const { network } = this.store.network;
		if (network) {
			this.initialized = false;
			await Promise.all([
				this.loadVaults(network.symbol),
				this.loadTokens(network.symbol),
				this.loadAssets(network.symbol),
			]);
			this.initialized = true;
		}
	}

	loadVaults = action(
		async (chain = Network.Ethereum): Promise<void> => {
			const settList = await this.store.api.loadVaults(Currency.ETH);

			if (settList) {
				this.settCache[chain] = Object.fromEntries(settList.map((vault) => [vault.vaultToken, vault]));
				this.slugCache[chain] = {
					...this.slugCache[chain],
					...Object.fromEntries(settList.map(formatVaultListItem)),
				};
				this.protocolTokens = new Set(settList.flatMap((s) => [s.underlyingToken, s.vaultToken]));
				// add badger to tracked tokens on networks where it is not a sett related token (ex: Arbitrum)
				const badgerToken = this.store.network.network.deploy.token;
				if (badgerToken && !this.protocolTokens.has(badgerToken)) {
					this.protocolTokens.add(badgerToken);
				}
			} else {
				this.settCache[chain] = null;
			}
		},
	);

	loadTokens = action(async (chain = Network.Ethereum): Promise<void> => {
		const tokenConfig = await this.store.api.loadTokens();
		if (tokenConfig) {
			this.tokenCache[chain] = tokenConfig;
		} else {
			this.tokenCache[chain] = null;
		}
	});

	loadAssets = action(async (chain = Network.Ethereum): Promise<void> => {
		const protocolSummary = await this.store.api.loadProtocolSummary(Currency.ETH);
		if (protocolSummary) {
			this.protocolSummaryCache[chain] = protocolSummary;
		} else {
			this.protocolSummaryCache[chain] = null;
		}
	});

	updateAvailableBalance = (returnContext: ContractCallReturnContext): void => {
		const { prices } = this.store;
		const settAddress = returnContext.originalContractCallContext.contractAddress;
		const vault = parseCallReturnContext(returnContext.callsReturnContext);
		if (!vault.available) {
			return;
		}
		const balanceResults = vault.available[0];
		if (!balanceResults || balanceResults.length === 0 || !settAddress) {
			return;
		}
		const settToken = this.getToken(settAddress);
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
