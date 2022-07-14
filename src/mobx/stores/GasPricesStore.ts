import { GasPrices, Network } from '@badger-dao/sdk';
import { computed, extendObservable } from 'mobx';
import { RootStore } from 'mobx/stores/RootStore';

import { ONE_MIN_MS } from '../../config/constants';
import { supportedNetworks } from '../../config/networks.config';
import { GasPricesSummary } from '../model/network/gas-prices-summary';

class GasPricesStore {
  private pricesCache: GasPricesSummary;

  constructor(private store: RootStore) {
    this.pricesCache = {};

    extendObservable(this, {
      pricesCache: this.pricesCache,
    });

    setInterval(async () => this.updateGasPrices(), ONE_MIN_MS / 2);
    this.updateGasPrices();
  }

  @computed
  get initialized(): boolean {
    return Object.keys(this.pricesCache).length > 0;
  }

  getGasPrices(network: Network): GasPrices | undefined {
    return this.pricesCache[network];
  }

  async updateGasPrices() {
    const pricesCache: GasPricesSummary = {};

    await Promise.all(
      supportedNetworks
        .filter((c) => c.network !== Network.Local)
        .map(async (chain) => {
          const prices = await this.store.sdk.api.loadGasPrices(chain.network);
          pricesCache[chain.id] = prices;
          pricesCache[chain.network] = prices;
          pricesCache[chain.name] = prices;
        }),
    );

    this.pricesCache = pricesCache;
  }
}

export default GasPricesStore;
