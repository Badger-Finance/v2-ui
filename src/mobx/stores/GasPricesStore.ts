import { BadgerAPI, Network, GasPrices } from '@badger-dao/sdk';
import { GasPricesSummary } from '../model/network/gas-prices-summary';
import { supportedNetworks } from '../../config/networks.config';
import { extendObservable } from 'mobx';
import { NETWORK_IDS, ONE_MIN_MS } from '../../config/constants';
import { Network as BadgerNetwork } from '../../mobx/model/network/network';

type BadgerApis = { [network: string]: BadgerAPI };

class GasPricesStore {
	private apis: BadgerApis;
	private gasNetworks: BadgerNetwork[];
	private pricesCache: GasPricesSummary;

	constructor() {
		this.gasNetworks = supportedNetworks.filter((network) => network.id !== NETWORK_IDS.LOCAL);
		this.pricesCache = {};
		this.apis = Object.fromEntries(
			this.gasNetworks.map((network) => {
				return [network.symbol, new BadgerAPI(network.id)];
			}),
		);

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
			this.gasNetworks.map((network) => this.apis[network.symbol].loadGasPrices()),
		);

		for (let i = 0; i < networkPrices.length; i++) {
			pricesCache[supportedNetworks[i].symbol] = networkPrices[i];
		}

		return pricesCache;
	}
}

export default GasPricesStore;
