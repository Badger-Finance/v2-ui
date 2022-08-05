import { ChartTimeFrame, VaultDTO, VaultSnapshot } from '@badger-dao/sdk';

import { RootStore } from './RootStore';

type ChartCacheByPeriod = Map<ChartTimeFrame, VaultSnapshot[]>;
type VaultCache = Map<VaultDTO['underlyingToken'], ChartCacheByPeriod>;

export class VaultChartsStore {
  private readonly store: RootStore;
  private readonly cache: VaultCache = new Map();

  constructor(store: RootStore) {
    this.store = store;
  }

  /**
   * Retrieves the charts data points from the provided vault within the provided timeframe
   * @param vault
   * @param timeframe
   */
  async search(vault: VaultDTO, timeframe: ChartTimeFrame): Promise<VaultSnapshot[]> {
    const vaultCache = this.cache.get(vault.underlyingToken);

    if (!vaultCache) {
      const timeFrameCache = new Map();
      const data = await this.fetchVaultChart(vault, timeframe);

      timeFrameCache.set(timeframe, data);
      this.cache.set(vault.underlyingToken, timeFrameCache);
      return data;
    }

    const timeFrameCache = vaultCache.get(timeframe);

    if (!timeFrameCache) {
      const data = await this.fetchVaultChart(vault, timeframe);
      vaultCache.set(timeframe, data);
      return data;
    }

    return timeFrameCache;
  }

  private async fetchVaultChart(vault: VaultDTO, timeframe: ChartTimeFrame): Promise<VaultSnapshot[]> {
    return this.store.api.loadVaultChart(vault.vaultToken, timeframe);
  }
}
