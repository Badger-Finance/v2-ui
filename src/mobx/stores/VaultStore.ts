import {
  Network,
  Protocol,
  ProtocolSummary,
  TokenConfiguration,
  VaultDTO,
  VaultDTOV3,
  VaultState,
} from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { action, makeAutoObservable, runInAction } from 'mobx';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { Chain } from 'mobx/model/network/chain';
import { ProtocolSummaryCache } from 'mobx/model/system-config/protocol-summary-cache';
import { Token } from 'mobx/model/tokens/token';
import { TokenCache } from 'mobx/model/tokens/token-cache';
import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { VaultCache } from 'mobx/model/vaults/vault-cache';
import { VaultSlugCache } from 'mobx/model/vaults/vault-slug-cache';
import { QueryParams } from 'mobx-router';
import slugify from 'slugify';

import routes from '../../config/routes';
import { getUserVaultBoost } from '../../utils/componentHelpers';
import { ETH_DEPLOY } from '../model/network/eth.network';
import { VaultsFilters, VaultSortOrder } from '../model/ui/vaults-filters';
import { VaultMap } from '../model/vaults/vault-map';
import { RootStore } from './RootStore';

export default class VaultStore {
  // loading: undefined, error: null, present: object
  public tokenCache: TokenCache = {};
  public vaultCache: VaultCache = {};
  public slugCache: VaultSlugCache = {};
  public protocolSummaryCache: ProtocolSummaryCache = {};

  public availableBalances: TokenBalances = {};
  public initialized = false;
  public showVaultFilters = false;
  public showStatusInformationPanel = false;
  public showRewardsInformationPanel = false;
  public vaultsFilters: VaultsFilters = {
    hidePortfolioDust: false,
    showAPR: false,
    onlyDeposits: false,
    onlyBoostedVaults: false,
  };

  constructor(private store: RootStore) {
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

  get vaultMap(): VaultMap {
    const { network } = this.store.chain;
    const vaults = this.vaultCache[network];
    if (!vaults) {
      return {};
    }
    return vaults;
  }

  get protocolSummary(): ProtocolSummary | undefined | null {
    return this.protocolSummaryCache[this.store.chain.network];
  }

  get tokenConfig(): TokenConfigRecord {
    return this.tokenCache[this.store.chain.network] ?? {};
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

  get protocolTokens(): Set<string> {
    return new Set(this.vaultTokens.concat(this.depositTokens));
  }

  get vaultTokens(): string[] {
    return Object.keys(this.vaultMap);
  }

  get depositTokens(): string[] {
    return Object.values(this.vaultMap).map((v) => v.underlyingToken);
  }

  get networkHasBoostVaults(): boolean {
    if (!this.vaultMap) {
      return false;
    }

    return Object.values(this.vaultMap).some((vault) => vault.boost.enabled);
  }

  getSlug(address: string): string {
    const { network: currentNetwork } = this.store.chain;

    return this.slugCache[currentNetwork][address];
  }

  getVault(address: string): VaultDTOV3 {
    if (!this.vaultMap) {
      throw new Error('Path will never run, non valid vaults never requested.');
    }

    return this.vaultMap[ethers.utils.getAddress(address)];
  }

  getVaultBySlug(slug: string): VaultDTOV3 | undefined | null {
    const { network: currentNetwork } = this.store.chain;

    if (!this.vaultMap) {
      return undefined;
    }

    const settBySlug = Object.entries(this.slugCache[currentNetwork]).find(({ 1: cachedSlug }) => cachedSlug === slug);

    if (!settBySlug) {
      return null;
    }

    return this.getVault(settBySlug[0]);
  }

  getVaultMapByState(state: VaultState): VaultMap {
    return Object.fromEntries(Object.entries(this.vaultMap).filter((entry) => entry[1].state === state));
  }

  get vaultOrder(): VaultDTOV3[] {
    let vaults = Object.values(this.vaultMap).slice();
    vaults = this.applyFilters(vaults);
    vaults = this.applySorting(vaults);
    return vaults;
  }

  getTokenConfigs(): TokenConfiguration {
    const { network } = this.store.chain;
    const tokenConfig = this.tokenCache[network];
    if (!tokenConfig) {
      return {};
    }
    return tokenConfig;
  }

  getToken(address: string): Token {
    const { network } = this.store.chain;
    const tokens = this.tokenCache[network];
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

  canUserWithdraw(vault: VaultDTO): boolean {
    const openBalance = this.store.user.getBalance(vault.vaultToken).balance;
    const guardedBalance = this.store.user.getBalance(vault.vaultToken).balance;
    return openBalance + guardedBalance > 0;
  }

  async refresh(): Promise<void> {
    const { network } = this.store.chain;
    if (network) {
      runInAction(() => {
        this.initialized = false;
      });
      await Promise.all([this.loadVaults(network), this.loadTokens(network), this.loadAssets(network)]);
      runInAction(() => {
        this.initialized = true;
      });
    }
  }

  loadVaults = action(async (chain = Network.Ethereum): Promise<void> => {
    try {
      const vaults = await this.store.api.loadVaultsV3();
      runInAction(() => {
        this.vaultCache[chain] = Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault]));
        this.slugCache[chain] = this.getVaultsSlugCache(vaults);
      });
    } catch (error) {
      console.error({
        error,
        message: `Error loading vaults for ${this.store.chain.network}`,
      });
    }
  });

  loadTokens = action(async (chain = Network.Ethereum): Promise<void> => {
    try {
      const tokens = await this.store.api.loadTokens();
      runInAction(() => {
        this.tokenCache[chain] = tokens;
      });
    } catch (error) {
      // if (FLAGS.SDK_INTEGRATION_ENABLED) {
      // 	const tokensList = Array.from(this.vaultsDefinitions?.values() ?? []).map(
      // 		(vault) => vault.depositToken.address,
      // 	);
      // 	tokenConfig = await this.store.sdk.tokens.loadTokens(tokensList);
      // }
    }
  });

  loadAssets = action(async (chain = Network.Ethereum): Promise<void> => {
    const protocolSummary = await this.store.api.loadProtocolSummary();
    runInAction(() => {
      if (protocolSummary) {
        this.protocolSummaryCache[chain] = protocolSummary;
      } else {
        this.protocolSummaryCache[chain] = null;
      }
    });
  });

  canUserDeposit(vault: VaultDTO): boolean {
    // rem badger does not support deposit
    if (vault.vaultToken === ETH_DEPLOY.sett_system.vaults['native.rembadger']) {
      return false;
    }

    if (vault.state === VaultState.Discontinued) {
      return false;
    }

    return this.store.user.onGuestList(vault);
  }

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
  mergeQueryParamsWithFilters(queryParams: Record<string, unknown>): QueryParams {
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

  async navigateToVaultDetail(vault: VaultDTO) {
    const { router } = this.store;

    return router.goTo(
      routes.vaultDetail,
      { vaultName: this.getSlug(vault.vaultToken) },
      { chain: router.queryParams?.chain },
    );
  }

  private applyFilters(vaults: VaultDTOV3[]): VaultDTOV3[] {
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
      vaults = vaults.filter((vault) => vault.boost.enabled);
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

  private applySorting(vaults: VaultDTOV3[]): VaultDTOV3[] {
    const { user, chain } = this.store;
    const chainDefinition = Chain.getChain(chain.network);
    const featuredVaultRank = Object.fromEntries(chainDefinition.vaultOrder().map((v, i) => [v, i + 1]));

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

  private getVaultYield(vault: VaultDTOV3): number {
    const { user } = this.store;
    const { showAPR } = this.vaultsFilters;

    if (!user.accountDetails) {
      return showAPR ? vault.apr.baseYield : vault.apy.baseYield;
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
