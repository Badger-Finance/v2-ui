import {
	Currency,
	Network,
	Protocol,
	ProtocolSummary,
	TokenConfiguration,
	VaultDTO,
	VaultState,
} from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { action, makeAutoObservable } from 'mobx';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { ProtocolSummaryCache } from 'mobx/model/system-config/protocol-summary-cache';
import { Token } from 'mobx/model/tokens/token';
import { TokenCache } from 'mobx/model/tokens/token-cache';
import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { VaultCache } from 'mobx/model/vaults/vault-cache';
import { VaultSlugCache } from 'mobx/model/vaults/vault-slug-cache';
import slugify from 'slugify';

import { getUserVaultBoost } from '../../utils/componentHelpers';
import { VaultsFilters, VaultSortOrder } from '../model/ui/vaults-filters';
import { BadgerVault } from '../model/vaults/badger-vault';
import { VaultMap } from '../model/vaults/vault-map';
import { VaultsDefinitionCache, VaultsDefinitions } from '../model/vaults/vaults-definition-cache';
import { RootStore } from './RootStore';

export default class VaultStore {
	// loading: undefined, error: null, present: object
	private vaultDefinitionsCache: VaultsDefinitionCache;
	private tokenCache: TokenCache;
	private vaultCache: VaultCache;
	private slugCache: VaultSlugCache;
	private protocolSummaryCache: ProtocolSummaryCache;
	public protocolTokensCache: Record<string, Set<string>>;
	public availableBalances: TokenBalances = {};
	public initialized: boolean;
	public showVaultFilters: boolean;
	public showStatusInformationPanel: boolean;
	public showRewardsInformationPanel: boolean;
	public vaultsFilters: VaultsFilters;

	constructor(private store: RootStore) {
		this.vaultDefinitionsCache = {};
		this.tokenCache = {};
		this.vaultCache = {};
		this.slugCache = {};
		this.protocolSummaryCache = {};
		this.protocolTokensCache = {};
		this.initialized = false;
		this.showVaultFilters = false;
		this.showStatusInformationPanel = false;
		this.showRewardsInformationPanel = false;

		this.vaultsFilters = {
			hidePortfolioDust: false,
			showAPR: false,
			onlyDeposits: false,
			onlyBoostedVaults: false,
		};

		makeAutoObservable(this);

		this.refresh();
	}

	get vaultsFiltersCount(): number {
		let count = 0;

		if (this.vaultsFilters.hidePortfolioDust) {
			count++;
		}

		if (this.vaultsFilters.behaviors && this.vaultsFilters.behaviors.length > 0) {
			count++;
		}

		if (this.vaultsFilters.protocols && this.vaultsFilters.protocols.length > 0) {
			count++;
		}

		if (this.vaultsFilters.statuses && this.vaultsFilters.statuses.length > 0) {
			count++;
		}

		if (this.vaultsFilters.types && this.vaultsFilters.types.length > 0) {
			count++;
		}

		if (this.vaultsFilters.search) {
			count++;
		}

		if (this.vaultsFilters.onlyDeposits) {
			count++;
		}

		if (this.vaultsFilters.onlyBoostedVaults) {
			count++;
		}

		return count;
	}

	get vaultMap(): VaultMap | undefined | null {
		return this.vaultCache[this.store.network.network.symbol];
	}

	get protocolSummary(): ProtocolSummary | undefined | null {
		return this.protocolSummaryCache[this.store.network.network.symbol];
	}

	get tokenConfig(): TokenConfigRecord | undefined | null {
		return this.tokenCache[this.store.network.network.symbol];
	}

	get vaultsDefinitions(): VaultsDefinitions | undefined | null {
		const { network: currentNetwork } = this.store.network;
		return this.vaultDefinitionsCache[currentNetwork.symbol];
	}

	get vaultsProtocols(): Protocol[] {
		if (!this.vaultMap) {
			return [];
		}

		return [
			...new Set(
				Object.values(this.vaultMap)
					.filter((v) => v.state !== VaultState.Discontinued)
					.map((vault) => vault.protocol),
			),
		];
	}

	get protocolTokens(): Set<string> | undefined {
		return this.protocolTokensCache[this.store.network.network.symbol];
	}

	get networkHasBoostVaults(): boolean {
		if (!this.vaultMap) {
			return false;
		}

		return Object.values(this.vaultMap).some((vault) => vault.boost.enabled);
	}

	getVaultDefinition(vault: VaultDTO): BadgerVault | undefined | null {
		return this.vaultsDefinitions?.get(vault.vaultToken);
	}

	getSlug(address: string): string {
		const { network: currentNetwork } = this.store.network;

		return this.slugCache[currentNetwork.symbol][address];
	}

	getVault(address: string): VaultDTO {
		if (!this.vaultMap) {
			throw new Error('Path will never run, non valid vaults never requested.');
		}

		return this.vaultMap[ethers.utils.getAddress(address)];
	}

	getVaultBySlug(slug: string): VaultDTO | undefined | null {
		const { network: currentNetwork } = this.store.network;

		if (!this.vaultMap) {
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

	getVaultOrder(): VaultDTO[] | undefined | null {
		const vaultMap = this.getVaultMap();

		if (vaultMap === undefined || this.vaultsDefinitions === undefined) {
			return undefined;
		}

		if (!vaultMap || !this.vaultsDefinitions) {
			return null;
		}

		let vaults = Array.from(this.vaultsDefinitions.values()).flatMap((vaultDefinition) => {
			const vault = vaultMap[ethers.utils.getAddress(vaultDefinition.vaultToken.address)];
			return vault ? [vault] : [];
		});

		vaults = this.applyFilters(vaults);
		vaults = this.applySorting(vaults);
		return vaults;
	}

	getVaultMap(): VaultMap | undefined | null {
		const { network } = this.store.network;
		const setts = this.vaultCache[network.symbol];
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
		const tokenAddress = ethers.utils.getAddress(address);
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
			this.initializeVaultsRegistry();
			await Promise.all([
				this.loadVaults(network.symbol),
				this.loadTokens(network.symbol),
				this.loadAssets(network.symbol),
			]);
			this.initialized = true;
		}
	}

	initializeVaultsRegistry = action(() => {
		const { network: currentNetwork } = this.store.network;
		const networkDeployVaults = Object.values(currentNetwork.deploy.sett_system.vaults) as string[];
		const networkVaultsMap = Object.fromEntries(
			currentNetwork.vaults.map((vault) => [vault.vaultToken.address, vault]),
		);

		this.vaultDefinitionsCache[currentNetwork.symbol] = new Map(
			networkDeployVaults.flatMap((vaultAddress) => {
				const vault = networkVaultsMap[vaultAddress];
				return vault ? [[vaultAddress, vault]] : [];
			}),
		);

		this.sanitizeVaultDefinitions();
	});

	loadVaults = action(async (chain = Network.Ethereum): Promise<void> => {
		let vaultList: VaultDTO[] | null = null;

		try {
			vaultList = await this.store.sdk.api.loadVaults();
		} catch (error) {
			console.error('There was an error fetching vaults from API: ', error);
			// if (FLAGS.SDK_INTEGRATION_ENABLED) {
			// 	const sdkVaults = await this.store.sdk.vaults.loadVaults();
			// 	vaultList = sdkVaults.map((sdkVault) => new RegistryVaultAdapter(sdkVault));
			// }
		}

		if (!vaultList) {
			this.vaultCache[chain] = null;
			return;
		}

		const badgerToken = this.store.network.network.deploy.token;
		const protocolTokens = new Set(vaultList.flatMap((s) => [s.underlyingToken, s.vaultToken]));

		// add badger to tracked tokens on networks where it is not a sett related token (ex: Arbitrum)
		if (badgerToken && !protocolTokens.has(badgerToken)) {
			protocolTokens.add(badgerToken);
		}

		this.protocolTokensCache[chain] = protocolTokens;
		this.vaultCache[chain] = Object.fromEntries(vaultList.map((vault) => [vault.vaultToken, vault]));
		this.slugCache[chain] = {
			...this.slugCache[chain],
			...this.getVaultsSlugCache(vaultList),
		};
	});

	loadTokens = action(async (chain = Network.Ethereum): Promise<void> => {
		let tokenConfig: TokenConfiguration | null = null;

		try {
			tokenConfig = await this.store.sdk.api.loadTokens();
		} catch (error) {
			// if (FLAGS.SDK_INTEGRATION_ENABLED) {
			// 	const tokensList = Array.from(this.vaultsDefinitions?.values() ?? []).map(
			// 		(vault) => vault.depositToken.address,
			// 	);
			// 	tokenConfig = await this.store.sdk.tokens.loadTokens(tokensList);
			// }
		}

		this.tokenCache[chain] = tokenConfig;
	});

	loadAssets = action(async (chain = Network.Ethereum): Promise<void> => {
		const protocolSummary = await this.store.sdk.api.loadProtocolSummary();
		if (protocolSummary) {
			this.protocolSummaryCache[chain] = protocolSummary;
		} else {
			this.protocolSummaryCache[chain] = null;
		}
	});

	setVaultsFilter = action(<T extends keyof VaultsFilters>(filter: T, value: VaultsFilters[T]) => {
		const { queryParams = {} } = this.store.router;
		this.vaultsFilters = {
			...this.vaultsFilters,
			[filter]: value,
		};
		this.store.router.queryParams = this.mergeQueryParamsWithFilters(queryParams);
	});

	openStatusInformationPanel = action(() => {
		this.showStatusInformationPanel = true;
	});

	closeStatusInformationPanel = action(() => {
		this.showStatusInformationPanel = false;
	});

	openRewardsInformationPanel = action(() => {
		this.showRewardsInformationPanel = true;
	});

	closeRewardsInformationPanel = action(() => {
		this.showRewardsInformationPanel = false;
	});

	/**
	 * It takes a queryParams object and returns a new object with the same properties, except that any properties that are
	 * also in the vaultsFilters object are replaced with the value of the vaultsFilters object
	 * @param queryParams - Record<string, any>
	 */
	mergeQueryParamsWithFilters(queryParams: Record<string, any>): Record<string, any> {
		const nonFilterParams = Object.entries(queryParams).filter(([key]) => !(key in this.vaultsFilters));
		const validParams = Object.entries(this.vaultsFilters).filter(([, value]) => !!value);
		return {
			...Object.fromEntries(nonFilterParams),
			...Object.fromEntries(validParams),
		};
	}

	clearFilters = action(() => {
		const { queryParams = {} } = this.store.router;
		this.vaultsFilters = {
			hidePortfolioDust: false,
			showAPR: false,
			onlyDeposits: false,
			onlyBoostedVaults: false,
			protocols: undefined,
			types: undefined,
			search: undefined,
			statuses: undefined,
			behaviors: undefined,
		};
		const nonFilterParams = Object.entries(queryParams).filter(([key]) => !(key in this.vaultsFilters));
		this.store.router.queryParams = { ...Object.fromEntries(nonFilterParams) };
	});

	/**
	 * Fetches the vaults on chain registry using the sdk and sanitizes the default registry.
	 * This process is done async to prevent load time increase.
	 */
	private sanitizeVaultDefinitions = action(async () => {
		// if (FLAGS.SDK_INTEGRATION_ENABLED && this.vaultsDefinitions) {
		// 	const { network: currentNetwork } = this.store.network;
		// 	const sdkVaults = await this.store.sdk.vaults.loadVaults();
		// 	const sdkVaultsMap: VaultsDefinitions = new Map(
		// 		sdkVaults.map((vault) => [
		// 			vault.address,
		// 			{
		// 				depositToken: vault.token,
		// 				vaultToken: {
		// 					address: vault.address,
		// 					decimals: vault.decimals,
		// 					symbol: vault.symbol,
		// 					name: vault.name,
		// 				},
		// 			},
		// 		]),
		// 	);
		// 	this.vaultsDefinitions.forEach((vaultDefinition, vaultDefinitionKey, vaultDefinitions) => {
		// 		const sdkVaultDefinition = sdkVaultsMap.get(vaultDefinitionKey);
		// 		if (!sdkVaultDefinition) {
		// 			vaultDefinitions.delete(vaultDefinitionKey);
		// 		}
		// 	});
		// 	this.vaultDefinitionsCache = {
		// 		...this.vaultDefinitionsCache,
		// 		[currentNetwork.symbol]: new Map([...this.vaultsDefinitions, ...sdkVaultsMap]),
		// 	};
		// }
	});

	private applyFilters(vaults: VaultDTO[]): VaultDTO[] {
		const { user } = this.store;

		const { protocols, search, statuses, behaviors, onlyBoostedVaults, onlyDeposits, hidePortfolioDust } =
			this.vaultsFilters;

		if (hidePortfolioDust) {
			// TODO: MAKE SURE TO UPDATE THIS TO USE USD RATES WE WILL CACHE
			// PLEASE DOG PLEASE
			// DO NOT FORGET :()
			vaults = vaults.filter((vault) => {
				const userBalance = user.getBalance(vault.vaultToken).value;

				// only evaluate vaults with deposited balance
				if (userBalance === 0) {
					return true;
				}

				// balance bigger than $1
				// TODO: BAD DOG EXCHANGE DOG PLEASE!!!!!!!!!!! VERIFY ME
				return userBalance > 1;
			});
		}

		if (onlyDeposits) {
			vaults = vaults.filter((vault) => user.getBalance(vault.vaultToken).value > 0);
		}

		if (onlyBoostedVaults && this.networkHasBoostVaults) {
			vaults = vaults.filter((vault) => vault.boost.enabled && !!vault.maxApr);
		}

		if (statuses && statuses.length > 0) {
			vaults = vaults.filter((vault) => statuses.includes(vault.state));
		}

		if (protocols && protocols.length > 0) {
			vaults = vaults.filter((vault) => protocols.includes(vault.protocol));
		}

		if (behaviors && behaviors.length > 0) {
			vaults = vaults.filter((vault) => behaviors.includes(vault.behavior));
		}

		if (search) {
			vaults = vaults.filter(
				(vault) =>
					vault.name.toLowerCase().includes(search.toLowerCase()) ||
					vault.vaultAsset.toLowerCase().includes(search.toLowerCase()) ||
					vault.protocol.toLowerCase().includes(search.toLowerCase()) ||
					vault.behavior.toLowerCase().includes(search.toLowerCase()) ||
					vault.state.toLowerCase().includes(search.toLowerCase()) ||
					vault.tokens.some(
						(token) =>
							token.name.toLowerCase().includes(search.toLowerCase()) ||
							token.symbol.toLowerCase().includes(search.toLowerCase()),
					),
			);
		}

		return vaults;
	}

	private applySorting(vaults: VaultDTO[]): VaultDTO[] {
		const { user, network } = this.store;

		switch (this.vaultsFilters.sortOrder) {
			case VaultSortOrder.NAME_ASC:
				vaults = vaults.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case VaultSortOrder.NAME_DESC:
				vaults = vaults.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case VaultSortOrder.APR_ASC:
				vaults = vaults.sort((a, b) => this.getVaultYield(a) - this.getVaultYield(b));
				break;
			case VaultSortOrder.APR_DESC:
				vaults = vaults.sort((a, b) => this.getVaultYield(b) - this.getVaultYield(a));
				break;
			case VaultSortOrder.TVL_ASC:
				vaults = vaults.sort((a, b) => a.value - b.value);
				break;
			case VaultSortOrder.TVL_DESC:
				vaults = vaults.sort((a, b) => b.value - a.value);
				break;
			case VaultSortOrder.BALANCE_ASC:
				vaults = vaults = vaults.sort((a, b) => {
					const balanceB = user.getBalance(b.vaultToken).value;
					const balanceA = user.getBalance(a.vaultToken).value;
					return balanceA - balanceB;
				});
				break;
			case VaultSortOrder.BALANCE_DESC:
				vaults = vaults = vaults.sort((a, b) => {
					const balanceB = user.getBalance(b.vaultToken).value;
					const balanceA = user.getBalance(a.vaultToken).value;
					return balanceB - balanceA;
				});
				break;
			default:
				const featuredVaultRank = Object.fromEntries(network.network.settOrder.map((v, i) => [v, i + 1]));
				// default sorting uses the following criteria:
				// 1 - balance deposited in vault
				// 2 - vault's underlying token balance
				// 3 - feature vaults
				// 4 - new vaults
				// 5 - boosted vaults
				vaults = vaults.sort((a, b) => {
					const vaultTokenBalanceB = user.getBalance(b.vaultToken).value;
					const vaultTokenBalanceA = user.getBalance(a.vaultToken).value;

					if (vaultTokenBalanceA !== 0 || vaultTokenBalanceB !== 0) {
						return vaultTokenBalanceB - vaultTokenBalanceA;
					}

					const depositTokenBalanceB = user.getBalance(b.underlyingToken).value;
					const depositTokenBalanceA = user.getBalance(a.underlyingToken).value;

					if (depositTokenBalanceB > 1 || depositTokenBalanceA > 1) {
						return depositTokenBalanceB - depositTokenBalanceA;
					}

					const rankA = featuredVaultRank[a.vaultToken];
					const rankB = featuredVaultRank[b.vaultToken];
					if (rankA || rankB) {
						return (rankA ?? Number.MAX_SAFE_INTEGER) - (rankB ?? Number.MAX_SAFE_INTEGER);
					}

					if (b.state === VaultState.Featured || a.state === VaultState.Featured) {
						const isVaultBNew = b.state === VaultState.Featured;
						const isVaultANew = a.state === VaultState.Featured;
						return Number(isVaultBNew) - Number(isVaultANew);
					}

					if (b.boost.enabled || a.boost.enabled) {
						return Number(b.boost.enabled) - Number(a.boost.enabled);
					}

					// leave default order
					return 0;
				});
				break;
		}

		return vaults;
	}

	private getVaultYield(vault: VaultDTO): number {
		const { user } = this.store;
		const { showAPR } = this.vaultsFilters;

		if (!user.accountDetails) {
			return showAPR ? vault.apr : vault.apy;
		}

		return getUserVaultBoost(vault, user.accountDetails.boost, showAPR);
	}

	private getVaultsSlugCache(vaults: VaultDTO[]): Record<string, string> {
		const occurrences: Record<string, number> = {};
		return Object.fromEntries(
			vaults.map((vault) => {
				const sanitizedVaultName = vault.name
					.replace(/[^\x00-\x7F]/g, '')
					.replace(/\/+/g, '-')
					.trim(); // replace "/" with "-"

				const appearances = occurrences[sanitizedVaultName] ?? 0;

				let slugStoreName = sanitizedVaultName;
				// in the event of duplicate vault names append an index suffix to prevent slug overlapping
				if (appearances > 0) {
					slugStoreName = `${sanitizedVaultName}-${occurrences[sanitizedVaultName]}`;
				}

				occurrences[sanitizedVaultName] = appearances + 1;

				return [vault.vaultToken, slugify(`${vault.protocol}-${slugStoreName}`, { lower: true })];
			}),
		);
	}
}
