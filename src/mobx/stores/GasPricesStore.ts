import { RootStore } from '../RootStore';
import { BadgerAPI, Network, GasPrices } from '@badger-dao/sdk';
import { GasPricesSummary } from '../model/network/gas-prices-summary';
import { supportedNetworks } from '../../config/networks.config';
import { extendObservable } from 'mobx';
import { ONE_MIN_MS } from '../../config/constants';
import { BADGER_API } from 'mobx/utils/apiV2';

class GasPricesStore {
  private store: RootStore;
  private pricesCache: GasPricesSummary;

  constructor(store: RootStore) {
    this.store = store;
    this.pricesCache = {};

    extendObservable(this, {
      pricesCache: this.pricesCache,
    });

    this.init();

    setInterval(async () => {
      await this.init();
    }, ONE_MIN_MS / 2);
  }

  get initialized(): boolean {
    return Object.keys(this.pricesCache).length > 0;
  }

  getGasPrices(network: Network): GasPrices | undefined {
    return this.pricesCache[network];
  }

  async init(): Promise<void> {
    const pricesCache: GasPricesSummary = {};

    // TODO: add support for multichain in the BadgerAPI an implement it here
    const networkPrices = await Promise.all(
      supportedNetworks.map((network) => {
        const api = new BadgerAPI(network.id, BADGER_API);
        return api.loadGasPrices();
      }),
    );

    for (let i = 0; i < networkPrices.length; i++) {
      pricesCache[supportedNetworks[i].symbol] = networkPrices[i];
    }

    this.pricesCache = pricesCache;
  }
}

export default GasPricesStore;
