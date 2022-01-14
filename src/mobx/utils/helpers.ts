import BigNumber from 'bignumber.js';
import { TEN, ZERO } from '../../config/constants';
import { API } from 'bnc-onboard/dist/src/interfaces';
import store from 'mobx/RootStore';
import { MarketChartStats } from 'mobx/model/charts/market-chart-stats';
import { MarketDelta } from 'mobx/model/charts/market-delta';
import { ChartData } from 'mobx/model/charts/chart-data';
import { Network } from 'mobx/model/network/network';
import { Currency } from 'config/enums/currency.enum';
import { currencyConfiguration } from 'config/currency.config';

export const jsonQuery = (url: string | undefined): Promise<Response> | undefined => {
	if (!url) return;
	return fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	}).then((response: any) => {
		return response.json();
	});
};

export const textQuery = (url: string): Promise<Response> => {
	// Use this query to return text without formatting to JSON for debugging
	return fetch(url, {}).then((response: any) => {
		return response.text();
	});
};

export const vanillaQuery = (url: string): Promise<Response> => {
	return fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
		},
	}).then((response: any) => response.json());
};

export const secondsToBlocks = (seconds: number): number => {
	return seconds / (1 / (6500 / (24 * 60 * 60)));
};

// TECH DEBT: Reformat these formatting functions using a factory pattern and delete repeated code

/**
 * Function for wrapping ETH based prices or values to be displayed in any currency.
 * @param value Amount of eth to be displayed.
 * @param currency
 * @param dispalyDecimals
 * @returns
 */
export function inCurrency(value: BigNumber, currency: Currency, dispalyDecimals?: number): string | undefined {
	const { exchangeRates } = store.prices;
	if (value.isNaN() || !exchangeRates) {
		return;
	}
	const currencyConfig = currencyConfiguration[currency];
	const { prefix, getExchangeRate, decimals } = currencyConfig;
	const conversionDecimals = dispalyDecimals ?? decimals;
	let converted = value.multipliedBy(getExchangeRate(exchangeRates));
	let suffix = '';
	if (converted.gt(0) && converted.lt(10 ** -conversionDecimals)) {
		converted = converted.multipliedBy(10 ** conversionDecimals);
		suffix = `e-${conversionDecimals}`;
	}
	const amount = numberWithCommas(converted.toFixed(conversionDecimals, BigNumber.ROUND_HALF_FLOOR));
	return `${prefix}${amount}${suffix}`;
}

interface DiggToCurrencyOptions {
	amount: BigNumber;
	currency: 'usd' | 'btc' | 'eth' | 'cad' | 'bnb';
	hide?: boolean;
	preferredDecimals?: number;
	noCommas?: boolean;
}

/**
 * Formats an amount in Digg to a specific currency
 *
 * @param options amount, currency, hide, preferredDecimals, noCommas
 * @returns formatted amount
 */
export const bDiggToCurrency = ({
	amount,
	currency,
	preferredDecimals = 2,
	noCommas = false,
}: DiggToCurrencyOptions): string | undefined => {
	const bDiggExchangeRates = store.prices.bDiggExchangeRates;
	if (!bDiggExchangeRates || amount.isNaN()) {
		return;
	}

	let normal = amount.dividedBy(1e18);
	let prefix = '';
	let decimals = preferredDecimals;

	switch (currency) {
		case 'usd':
			normal = normal.multipliedBy(bDiggExchangeRates.usd);
			decimals = 2;
			prefix = '$ ';
			break;
		case 'btc':
			normal = normal.multipliedBy(bDiggExchangeRates.btc);
			decimals = 5;
			prefix = '₿ ';
			break;
		case 'eth':
			normal = normal.multipliedBy(bDiggExchangeRates.eth);
			prefix = 'Ξ ';
			decimals = 5;
			break;
		case 'cad':
			normal = normal.multipliedBy(bDiggExchangeRates.cad);
			decimals = 2;
			prefix = 'C$';
			break;
		case 'bnb':
			normal = normal.multipliedBy(bDiggExchangeRates.bnb);
			decimals = 2;
			prefix = '/assets/icons/bnb-white.png';
			break;
	}

	let suffix = '';

	if (normal.gt(0) && normal.lt(10 ** -decimals)) {
		normal = normal.multipliedBy(10 ** decimals);
		suffix = `e-${decimals}`;
	} else if (normal.dividedBy(1e4).gt(1)) {
		decimals = preferredDecimals;
	}

	const fixedNormal = noCommas
		? normal.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR)
		: numberWithCommas(normal.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR));

	return `${prefix}${fixedNormal}${suffix}`;
};

export const formatTokens = (value: BigNumber, decimals = 5): string => {
	if (!value || value.isNaN()) {
		let formattedZero = '0.';
		for (let i = 0; i < decimals; i++) {
			formattedZero += '0';
		}
		return formattedZero;
	} else {
		if (value.gt(0) && value.lt(10 ** -decimals)) {
			return '< 0.00001';
		} else if (value.dividedBy(1e4).gt(1)) {
			decimals = 2;
		}
		return numberWithCommas(value.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR));
	}
};

/**
 * Converts a bignumber instance to a string equivalent with the provided number of decimals.
 * If the amount is smaller than 10 ** decimals, scientific notation is used.
 * @param amount amount to be converted
 * @param decimals decimals the the converted amount will have
 */
export const toFixedDecimals = (amount: BigNumber, decimals: number): string => {
	if (amount.isNaN() || amount.isZero()) {
		return ZERO.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR);
	}

	if (amount.lt(10 ** -decimals)) {
		const normalizedValue = amount.multipliedBy(10 ** decimals);
		return `${normalizedValue.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR)}e-${decimals}`;
	}

	return amount.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR);
};

export const numberWithCommas = (x: string): string => {
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
};

export const formatWithoutExtraZeros = (
	amount: BigNumber.Value,
	decimals = 6,
	strategy = BigNumber.ROUND_HALF_FLOOR,
): string => {
	return new BigNumber(amount).decimalPlaces(decimals, strategy).toString();
};

export async function fetchDiggChart(chart: string, range: number): Promise<ChartData | undefined> {
	const to = new Date();
	const from = new Date();
	from.setDate(to.getDate() - range);

	const queryRange = `from=${from.getTime() / 1000}&to=${to.getTime() / 1000}`;
	const url = `https://api.coingecko.com/api/v3/coins/digg/market_chart/range?vs_currency=usd&${queryRange}`;
	const response = await fetch(url);
	if (!response.ok) {
		return;
	}
	const result = await response.json();
	const data = reduceMarketChart(result[chart], range, to);
	const calcs = marketChartStats(data, 'close');
	return {
		from,
		to,
		data,
		stats: calcs,
	};
}

const reduceMarketChart = (data: any[], range: number, maxDate: Date): MarketDelta[] => {
	const formatted = data.map((value: any, index: number) => {
		const date = new Date();

		// if range less than 90 days, coingecko's data points are 1 hour apart.
		// otherwise, 1 day
		// in ascending order up to the max date requested
		if (range <= 90) date.setHours(maxDate.getHours() - (data.length - index));
		else date.setDate(maxDate.getDate() - (data.length - index));

		return {
			date: date,
			close: value[0],
			change: value[1],
		};
	});
	return formatted;
};

// TODO: clean up this function
export function marketChartStats(dataSet: Array<any>, accessor: string): MarketChartStats {
	// highest high
	const dataCopy: Array<any> = dataSet.slice(0);
	const sortedData = dataCopy.sort((a, b) => a[accessor] - b[accessor]);
	const high = Math.round((sortedData[sortedData.length - 1][accessor] + Number.EPSILON) * 100) / 100;

	// highest high
	const low = Math.round((sortedData[0][accessor] + Number.EPSILON) * 100) / 100;

	// average of open
	let total = 0;
	for (let i = 0; i < dataSet.length; i++) {
		total += dataSet[i][accessor];
	}
	const avg = Math.round((total / dataSet.length + Number.EPSILON) * 100) / 100;

	// median of open
	const mid = Math.ceil(dataSet.length / 2);

	const m =
		dataSet.length % 2 === 0
			? (sortedData[mid][accessor] + sortedData[mid - 1][accessor]) / 2
			: sortedData[mid - 1][accessor];
	const median = Math.round((m + Number.EPSILON) * 100) / 100;

	return { high, low, avg, median };
}

// Reason: blocknative does not type their provider, must be any
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getNetworkFromProvider = (provider?: any): string | undefined => {
	try {
		return provider
			? Network.networkFromId(parseInt(new BigNumber(provider.chainId, 16).toString(10))).symbol
			: undefined;
	} catch (e) {
		return undefined;
	}
};

export const unscale = (amount: BigNumber, decimals: number): BigNumber => amount.dividedBy(TEN.pow(decimals));
export const toHex = (amount: BigNumber): string => '0x' + amount.toString(16);
export const minBalance = (decimals: number): BigNumber => new BigNumber(`0.${'0'.repeat(decimals - 1)}1`);
export const isWithinRange = (value: number, min: number, max: number): boolean => value >= min && value < max;

/**
 * Easy interface to check to see if wallet selection is handled and ready to connect
 * via onboard.js.  To be reused if connect buttons are displayed in multiple components
 * @param onboard = instance of the onboard.js API
 * @param connect = connect function from the wallet store
 */
export const connectWallet = async (onboard: API, connect: (wsOnboard: any) => void): Promise<void> => {
	const walletSelected = await onboard.walletSelect();
	if (walletSelected) {
		const readyToTransact = await onboard.walletCheck();
		if (readyToTransact) {
			connect(onboard);
		}
	}
};
