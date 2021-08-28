import { retry } from '@lifeomic/attempt';
import BigNumber from 'bignumber.js';
import { defaultRetryOptions } from 'config/constants';
import { action, extendObservable, IValueDidChange, observe } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { getTokenPrices } from 'mobx/utils/apiV2';
import { fetchData } from 'mobx/utils/helpers';
import Web3 from 'web3';
import { ExchangeRates } from '../model/system-config/exchange-rates';
import { BDiggExchangeRates } from '../model/system-config/bDigg-exchange-rates';
import { PriceSummary } from '../model/system-config/price-summary';
import { Network } from 'mobx/model/network/network';

export default class PricesStore {
	private store: RootStore;
	private priceCache: PriceSummary;
	public exchangeRates?: ExchangeRates;
	public bDiggExchangeRates?: BDiggExchangeRates;

	constructor(store: RootStore) {
		this.store = store;
		this.priceCache = {};

		extendObservable(this, {
			exchangeRates: undefined,
			bDiggExchangeRates: undefined,
			priceCache: this.priceCache,
			arePricesAvailable: this.arePricesAvailable,
		});

		observe(this.store.network, 'network', (change: IValueDidChange<Network>) => {
			const { newValue } = change;
			this.loadPrices(newValue.symbol);
		});

		this.init();
	}

	get arePricesAvailable(): boolean {
		return Object.keys(this.priceCache).length > 0;
	}

	async init(): Promise<void> {
		const network = this.store.network.network.symbol ?? undefined;
		await Promise.all([this.loadPrices(network), this.loadExchangeRates()]);
	}

	getPrice(address: string): BigNumber {
		return this.priceCache[Web3.utils.toChecksumAddress(address)] ?? new BigNumber(0);
	}

	loadPrices = action(
		async (network?: string): Promise<void> => {
			const prices = await getTokenPrices(network);
			if (prices) {
				Object.entries(prices).forEach((entry) => {
					const [key, value] = entry;
					prices[key] = new BigNumber(value);
				});
				this.priceCache = {
					...this.priceCache,
					...prices,
				};
				// console.log(
				// 	'price cache =>',
				// 	toJS(
				// 		Object.entries(this.priceCache).map((entry) => ({
				// 			token: entry[0],
				// 			price: entry[1].toString(),
				// 		})),
				// 	),
				// );
				// console.log(
				// 	'is matic curve available =>',
				// 	Object.keys(this.priceCache).includes('0x172370d5Cd63279eFa6d502DAB29171933a610AF'),
				// );
				await this.store.rewards.fetchSettRewards();
			}
			// this.arePricesInitialized = true;
		},
	);

	loadExchangeRates = action(
		async (): Promise<void> => {
			await retry(async () => {
				const [exchangeRates, bDiggExchangeRates]: [
					ExchangeRates | undefined,
					BDiggExchangeRates | undefined,
				] = await Promise.all([this.getExchangeRates(), this.getBdiggExchangeRates()]);
				this.exchangeRates = exchangeRates;
				this.bDiggExchangeRates = bDiggExchangeRates;
			}, defaultRetryOptions);
		},
	);

	async getExchangeRates(): Promise<ExchangeRates | undefined> {
		const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,cad,btc,bnb';
		const errorMessage = 'Failed to load exchange rates';
		const accessor = (res: any) => res.ethereum;
		return fetchData(url, errorMessage, accessor);
	}

	async getBdiggExchangeRates(): Promise<BDiggExchangeRates | undefined> {
		const url =
			'https://api.coingecko.com/api/v3/simple/price/?ids=badger-sett-digg&vs_currencies=usd,eth,btc,cad,bnb';
		const errorMessage = 'Failed to load exchange rates';
		const accessor = (res: any) => res['badger-sett-digg'];
		return fetchData(url, errorMessage, accessor);
	}
}
