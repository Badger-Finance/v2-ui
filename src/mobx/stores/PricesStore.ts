import { PriceSummary } from '@badger-dao/sdk';
import { ethers } from 'ethers';
import { action, makeAutoObservable } from 'mobx';

import { RootStore } from './RootStore';

export default class PricesStore {
	private priceCache: PriceSummary = {};

	constructor(private store: RootStore) {
		makeAutoObservable(this);
		this.loadPrices();
	}

	getPrice(address: string): number {
		const price = this.priceCache[ethers.utils.getAddress(address)];
		return price ? price : 0;
	}

	loadPrices = action(async (): Promise<void> => {
		const prices = await this.store.api.loadPrices();
		if (prices) {
			this.priceCache = {
				...this.priceCache,
				...prices,
			};
		}
	});
}
