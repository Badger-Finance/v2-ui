import { BadgerAPI, Network, GasPrices } from '@badger-dao/sdk';
import { GasPricesSummary } from '../model/network/gas-prices-summary';
import { supportedNetworks } from '../../config/networks.config';
import { extendObservable } from 'mobx';
import { NETWORK_IDS, ONE_MIN_MS } from '../../config/constants';
import { Network as BadgerNetwork } from '../../mobx/model/network/network';
import { RootStore } from 'mobx/RootStore';

class GasPricesStore {
	private gasNetworks: BadgerNetwork[];
	private pricesCache: GasPricesSummary;

	constructor(private store: RootStore) {
		this.gasNetworks = supportedNetworks.filter((network) => network.id !== NETWORK_IDS.LOCAL);
		this.pricesCache = {};

		extendObservable(this, {
			pricesCache: this.pricesCache,
		});

		setInterval(async () => {
			this.pricesCache = await this.updateGasPrices();
		}, ONE_MIN_MS / 2);
		this.updateGasPrices();
	}

	get initialized(): boolean {
		return Object.keys(this.pricesCache).length > 0;
	}

	getGasPrices(network: Network): GasPrices | undefined {
		return this.pricesCache[network];
	}

	async updateGasPrices(): Promise<GasPricesSummary> {
		const pricesCache: GasPricesSummary = {};

		const networkPrices = await Promise.all(
			this.gasNetworks.map((network) => this.store.sdk.api.loadGasPrices(network.symbol)),
		);

		for (let i = 0; i < networkPrices.length; i++) {
			pricesCache[supportedNetworks[i].symbol] = networkPrices[i];
		}

		return pricesCache;
	}
}

export default GasPricesStore;
