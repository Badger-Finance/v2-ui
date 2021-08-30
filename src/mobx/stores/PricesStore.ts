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
import { ChainNetwork } from '../../config/enums/chain-network.enum';

export default class PricesStore {
	private store: RootStore;
	private priceCache: PriceSummary;
	public exchangeRates?: ExchangeRates;
	public bDiggExchangeRates?: BDiggExchangeRates;
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
			'https://api.coingecko.com/api/v3/simple/price?ids=badger-sett-digg&vs_currencies=usd,eth,btc,cad,bnb';
		const errorMessage = 'Failed to load exchange rates';
		const accessor = (res: any) => res['badger-sett-digg'];
		return fetchData(url, errorMessage, accessor);
	}
}
