import { Currency, PriceSummary } from '@badger-dao/sdk';
import { retry } from '@lifeomic/attempt';
import { defaultRetryOptions } from 'config/constants';
import { ethers } from 'ethers';
import { action, extendObservable, makeAutoObservable } from 'mobx';
import {
	CoingeckoPriceResponse,
	FANTOM_PRICE_KEY,
	MATIC_PRICE_KEY,
} from 'mobx/model/system-config/coingecko-price-response';

import { DEBUG } from '../../config/environment';
import { fetchData } from '../../utils/fetchData';
import { RootStore } from './RootStore';

type CoinGeckoBatchResponse = { [key: string]: CoingeckoPriceResponse };

export default class PricesStore {
	private store: RootStore;
	private priceCache: PriceSummary;

	public pricesAvailability: Record<string, boolean> = {};

	constructor(store: RootStore) {
		this.store = store;
		this.priceCache = {};

		makeAutoObservable(this);
	}

	get arePricesAvailable(): boolean {
		const { network } = this.store.network;
		return this.pricesAvailability[network.symbol] ?? false;
	}

	getPrice(address: string): number {
		const price = this.priceCache[ethers.utils.getAddress(address)];
		return price ? price : 0;
	}

	loadPrices = action(async (): Promise<void> => {
		const { network } = this.store.network;
		const prices = await this.store.sdk.api.loadPrices(Currency.ETH);
		if (prices) {
			this.priceCache = {
				...this.priceCache,
				...prices,
			};

			this.pricesAvailability = {
				...this.pricesAvailability,
				[network.symbol]: true,
			};
		}
	});
}
