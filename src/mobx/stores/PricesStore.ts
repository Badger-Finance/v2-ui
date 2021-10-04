import { retry } from '@lifeomic/attempt';
import BigNumber from 'bignumber.js';
import { defaultRetryOptions } from 'config/constants';
import { action, extendObservable, IValueDidChange, observe } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { getTokenPrices } from 'mobx/utils/apiV2';
import Web3 from 'web3';
import { ExchangeRates } from '../model/system-config/exchange-rates';
import { BDiggExchangeRates } from '../model/system-config/bDigg-exchange-rates';
import { PriceSummary } from '../model/system-config/price-summary';
import { Network } from 'mobx/model/network/network';
import { ChainNetwork } from 'config/enums/chain-network.enum';
import { ExchangeRatesResponse } from 'mobx/model/system-config/exchange-rates-response';
import { MaticPriceResponse, MATIC_PRICE_KEY } from 'mobx/model/system-config/matic-price-response';
import { fetchData } from '../../utils/fetchData';
import { DEBUG } from '../../config/environment';

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

		observe(this.store.network, 'network', (change: IValueDidChange<Network>) => {
			const { newValue } = change;
			this.loadPrices(newValue.symbol);
		});

		this.init();
	}

	get arePricesAvailable(): boolean {
		const { network } = this.store.network;
		return this.pricesAvailability[network.symbol] ?? false;
	}

	async init(): Promise<void> {
		const network = this.store.network.network.symbol ?? undefined;
		await Promise.all([this.loadPrices(network), this.loadExchangeRates()]);
	}

	getPrice(address: string): BigNumber {
		return this.priceCache[Web3.utils.toChecksumAddress(address)] ?? new BigNumber(0);
	}

	loadPrices = action(
		async (network = ChainNetwork.Ethereum): Promise<void> => {
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

				this.pricesAvailability = {
					...this.pricesAvailability,
					[network]: true,
				};
			}
		},
	);

	loadExchangeRates = action(
		async (): Promise<void> => {
			await retry(async () => {
				const [exchangeRates, bDiggExchangeRates]: [
					ExchangeRates | null,
					BDiggExchangeRates | null,
				] = await Promise.all([this.getExchangeRates(), this.getBdiggExchangeRates()]);
				this.exchangeRates = exchangeRates;
				this.bDiggExchangeRates = bDiggExchangeRates;
			}, defaultRetryOptions);
		},
	);

	async getExchangeRates(): Promise<ExchangeRates | null> {
		const baseRatesUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,cad,btc,bnb';
		const maticRateUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=eth';
		const errorMessage = 'Failed to load exchange rates';
		const defaultAccessor = (res: ExchangeRatesResponse) => res.ethereum;
		const maticAccessor = (res: MaticPriceResponse) => res[MATIC_PRICE_KEY].eth;

		const [defaultRatesFetch, maticRateFetch] = await Promise.all([
			fetchData<ExchangeRates, ExchangeRatesResponse>(baseRatesUrl, { accessor: defaultAccessor }),
			fetchData<number, MaticPriceResponse>(maticRateUrl, { accessor: maticAccessor }),
		]);

		const [defaultRates] = defaultRatesFetch;
		const [maticRate] = maticRateFetch;

		const areRatesNotAvailable = !defaultRates || !maticRateFetch;

		if (DEBUG && areRatesNotAvailable) {
			this.store.uiState.queueNotification(errorMessage, 'error');
		}

		if (defaultRates && maticRate) {
			defaultRates.matic = 1 / Number(maticRate);
		}

		return defaultRates;
	}

	async getBdiggExchangeRates(): Promise<BDiggExchangeRates | null> {
		const url =
			'https://api.coingecko.com/api/v3/simple/price?ids=badger-sett-digg&vs_currencies=usd,eth,btc,cad,bnb';
		const accessor = (res: any) => res['badger-sett-digg'];

		const [rates] = await fetchData(url, { accessor });

		if (!rates && DEBUG) {
			this.store.uiState.queueNotification('Failed to load exchange rates', 'error');
		}

		return rates;
	}
}
