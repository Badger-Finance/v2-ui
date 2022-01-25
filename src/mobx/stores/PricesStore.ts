import { retry } from '@lifeomic/attempt';
import { defaultRetryOptions } from 'config/constants';
import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import Web3 from 'web3';
import { ExchangeRates } from '../model/system-config/exchange-rates';
import { BDiggExchangeRates } from '../model/system-config/bDigg-exchange-rates';
import { ExchangeRatesResponse } from 'mobx/model/system-config/exchange-rates-response';
import {
	CoingeckoPriceResponse,
	FANTOM_PRICE_KEY,
	MATIC_PRICE_KEY,
} from 'mobx/model/system-config/coingecko-price-response';
import { fetchData } from '../../utils/fetchData';
import { DEBUG } from '../../config/environment';
import BigNumber from 'bignumber.js';
import { Currency, PriceSummary } from '@badger-dao/sdk';

type CoinGeckoBatchResponse = { [key: string]: CoingeckoPriceResponse };

export default class PricesStore {
	private store: RootStore;
	private priceCache: PriceSummary;
	public exchangeRates?: ExchangeRates | null;
	public bDiggExchangeRates?: BDiggExchangeRates | null;
	public pricesAvailability: Record<string, boolean> = {};

	constructor(store: RootStore) {
		this.store = store;
		this.priceCache = {};

		extendObservable(this, {
			exchangeRates: undefined,
			bDiggExchangeRates: undefined,
			priceCache: this.priceCache,
			pricesAvailability: this.pricesAvailability,
		});

		this.init();
	}

	get arePricesAvailable(): boolean {
		const { network } = this.store.network;
		return this.pricesAvailability[network.symbol] ?? false;
	}

	async init(): Promise<void> {
		await Promise.all([this.loadPrices(), this.loadExchangeRates()]);
	}

	getPrice(address: string): BigNumber {
		const price = this.priceCache[Web3.utils.toChecksumAddress(address)];
		return price ? new BigNumber(price) : new BigNumber(0);
	}

	loadPrices = action(async (): Promise<void> => {
		const { network } = this.store.network;
		const prices = await this.store.api.loadPrices(Currency.ETH);
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

	loadExchangeRates = action(async (): Promise<void> => {
		await retry(async () => {
			const [exchangeRates, bDiggExchangeRates]: [ExchangeRates | null, BDiggExchangeRates | null] =
				await Promise.all([this.getExchangeRates(), this.getBdiggExchangeRates()]);
			this.exchangeRates = exchangeRates;
			this.bDiggExchangeRates = bDiggExchangeRates;
		}, defaultRetryOptions);
	});

	async getExchangeRates(): Promise<ExchangeRates | null> {
		const baseRatesUrl =
			'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,cad,btc,bnb,ftm';
		const maticRateUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network,fantom&vs_currencies=eth';
		const errorMessage = 'Failed to load exchange rates';
		const defaultAccessor = (res: ExchangeRatesResponse) => res.ethereum;

		const [defaultRatesFetch, otherRatesFetch] = await Promise.all([
			fetchData<ExchangeRates, ExchangeRatesResponse>(baseRatesUrl, { accessor: defaultAccessor }),
			fetchData<CoinGeckoBatchResponse, CoinGeckoBatchResponse>(maticRateUrl),
		]);

		const [defaultRates, defaultRatesError] = defaultRatesFetch;
		const [otherRates, otherRatesError] = otherRatesFetch;
		const ratesMissing = defaultRatesError || otherRatesError;

		if (DEBUG && ratesMissing) {
			this.store.uiState.queueError(errorMessage);
		}

		if (defaultRates && otherRates) {
			defaultRates.matic = 1 / Number(otherRates[MATIC_PRICE_KEY].eth);
			defaultRates.ftm = 1 / Number(otherRates[FANTOM_PRICE_KEY].eth);
		}

		return defaultRates;
	}

	async getBdiggExchangeRates(): Promise<BDiggExchangeRates | null> {
		const url =
			'https://api.coingecko.com/api/v3/simple/price?ids=badger-sett-digg&vs_currencies=usd,eth,btc,cad,bnb';
		const accessor = (res: any) => res['badger-sett-digg'];

		const [rates] = await fetchData(url, { accessor });

		if (!rates && DEBUG) {
			this.store.uiState.queueError('Failed to load exchange rates');
		}

		return rates;
	}
}
