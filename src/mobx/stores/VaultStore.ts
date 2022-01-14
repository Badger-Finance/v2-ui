import { action, extendObservable } from 'mobx';
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
import { Currency, Network, ProtocolSummary, TokenConfiguration, Vault, VaultState } from '@badger-dao/sdk';
import { VaultSlugCache } from '../model/vaults/vault-slug-cache';
import { parseCallReturnContext } from '../utils/multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';
import { VaultsFilters, VaultSortOrder } from '../model/ui/vaults-filters';
import { Currency as UiCurrency } from '../../config/enums/currency.enum';

const formatVaultListItem = (vault: Vault): [string, string] => {
	const sanitizedVaultName = vault.name.replace(/\/+/g, '-'); // replace "/" with "-"
	return [vault.vaultToken, slugify(`${vault.protocol}-${sanitizedVaultName}`, { lower: true })];
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
	public showVaultFilters: boolean;
	public vaultsFilters: VaultsFilters;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			tokenCache: undefined,
			protocolSummaryCache: undefined,
			settCache: undefined,
			priceCache: undefined,
			initialized: false,
			availableBalances: this.availableBalances,
			vaultsFilters: {},
			showVaultFilters: false,
		});

		this.tokenCache = {};
		this.settCache = {};
		this.slugCache = {};
		this.protocolSummaryCache = {};
		this.protocolTokens = new Set();
		this.initialized = false;
		this.showVaultFilters = false;
		this.vaultsFilters = {
			hidePortfolioDust: false,
			currency: store.uiState.currency,
			protocols: [],
			types: [],
			sortOrder: VaultSortOrder.BALANCE_DESC,
		};

		this.refresh();
	}

	get vaultsFiltersCount(): number {
		let count = 0;

		if (this.vaultsFilters.hidePortfolioDust) {
			count++;
		}

		if (this.vaultsFilters.currency !== UiCurrency.USD) {
			count++;
		}

		if (this.vaultsFilters.protocols.length > 0) {
			count++;
		}

		if (this.vaultsFilters.types.length > 0) {
			count++;
		}

		return count;
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

	getVaultOrderByState(state: VaultState, sortOrder?: VaultSortOrder): Vault[] | undefined | null {
		const {
			user,
			network: { network },
			prices: { exchangeRates },
		} = this.store;

		const vaultMap = this.getVaultMap();

		if (!vaultMap) {
			return vaultMap;
		}

		const networkVaultOrder = network.settOrder;
		const stateFilteredVaultMap = Object.fromEntries(
			Object.entries(vaultMap).filter((entry) => entry[1].state === state),
		);

		let vaults = networkVaultOrder.flatMap((vaultAddress) => {
			const vault = stateFilteredVaultMap[Web3.utils.toChecksumAddress(vaultAddress)];
			return vault ? [vault] : [];
		});

		if (this.vaultsFilters.hidePortfolioDust) {
			if (exchangeRates) {
				vaults = vaults.filter((vault) => {
					const userBalance = user.getTokenBalance(vault.vaultToken).value;

					// only evaluate vaults with deposited balance
					if (userBalance.isZero()) {
						return true;
					}

					// balance bigger than $1
					return userBalance.multipliedBy(exchangeRates.usd).gt(1);
				});
			} else {
				console.error('Portfolio dust filtering was skipped because the exchanges rates are not available');
			}
		}

		if (this.vaultsFilters.protocols.length > 0) {
			vaults = vaults.filter((vault) => this.vaultsFilters.protocols.includes(vault.protocol));
		}

		if (this.vaultsFilters.types.length > 0) {
			vaults = vaults.filter((vault) => this.vaultsFilters.types.includes(vault.type));
		}

		switch (sortOrder) {
			case VaultSortOrder.APR_ASC:
				vaults = vaults.sort((a, b) => a.apr - b.apr);
				break;
			case VaultSortOrder.APR_DESC:
				vaults = vaults.sort((a, b) => b.apr - a.apr);
				break;
			case VaultSortOrder.TVL_ASC:
				vaults = vaults.sort((a, b) => a.value - b.value);
				break;
			case VaultSortOrder.TVL_DESC:
				vaults = vaults.sort((a, b) => b.value - a.value);
				break;
			case VaultSortOrder.BALANCE_ASC:
				vaults = vaults = vaults.sort((a, b) => {
					const balanceB = user.getTokenBalance(b.vaultToken).value;
					const balanceA = user.getTokenBalance(a.vaultToken).value;
					return balanceA.minus(balanceB).toNumber();
				});
				break;
			case VaultSortOrder.BALANCE_DESC:
				vaults = vaults = vaults.sort((a, b) => {
					const balanceB = user.getTokenBalance(b.vaultToken).value;
					const balanceA = user.getTokenBalance(a.vaultToken).value;
					return balanceB.minus(balanceA).toNumber();
				});
				break;
			default:
				break;
		}

		return vaults;
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

	loadVaults = action(async (chain = Network.Ethereum): Promise<void> => {
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
	});

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

	clearFilters = action(() => {
		this.vaultsFilters = {
			hidePortfolioDust: false,
			currency: this.store.uiState.currency,
			protocols: [],
			types: [],
			sortOrder: VaultSortOrder.BALANCE_DESC,
		};
	});
}
