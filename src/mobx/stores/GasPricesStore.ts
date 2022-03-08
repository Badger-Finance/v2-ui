import { BadgerAPI, Network, GasPrices } from '@badger-dao/sdk';
import { GasPricesSummary } from '../model/network/gas-prices-summary';
import { supportedNetworks } from '../../config/networks.config';
import { computed, extendObservable } from 'mobx';
import { NETWORK_IDS, ONE_MIN_MS } from '../../config/constants';
import { Network as BadgerNetwork } from '../../mobx/model/network/network';
import { RootStore } from 'mobx/RootStore';
import { DEBUG } from 'config/environment';
import { ThreeSixty } from '@material-ui/icons';

class GasPricesStore {
	private gasNetworks: BadgerNetwork[];
	private pricesCache: GasPricesSummary;

	constructor(private store: RootStore) {
		this.gasNetworks = supportedNetworks.filter((network) => network.id !== NETWORK_IDS.LOCAL);
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
			this.gasNetworks.map(async (network) => {
				if (DEBUG) {
					console.log(`Request gas prices for ${network.name}`);
				}
				const prices = await this.store.sdk.api.loadGasPrices(network.symbol);
				pricesCache[network.id] = prices;
				pricesCache[network.symbol] = prices;
				pricesCache[network.name] = prices;
			}),
		);

		this.pricesCache = pricesCache;
	}
}

export default GasPricesStore;
