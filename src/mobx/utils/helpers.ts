import { TEN } from '../../config/constants';
import { API } from 'bnc-onboard/dist/src/interfaces';
import store, { RootStore } from 'mobx/RootStore';
import { MarketChartStats } from 'mobx/model/charts/market-chart-stats';
import { MarketDelta } from 'mobx/model/charts/market-delta';
import { ChartData } from 'mobx/model/charts/chart-data';
import { Network } from 'mobx/model/network/network';
import { Currency } from 'config/enums/currency.enum';
import { currencyConfiguration } from 'config/currency.config';
import routes from 'config/routes';
import SettStore from 'mobx/stores/SettStore';
import { Route } from 'mobx-router';
import { SettState } from '@badger-dao/sdk';
import { BigNumber, ethers } from 'ethers';

export const secondsToBlocks = (seconds: number): number => {
	return seconds / (1 / (6500 / (24 * 60 * 60)));
};

export function formatBalance(amount: BigNumber, decimals = 18): number {
	return Number(formatBalanceString(amount, decimals));
}

export function formatBalanceString(amount: BigNumber, decimals = 18): string {
	return ethers.utils.formatUnits(amount, decimals);
}

/**
 * Function for wrapping ETH based prices or values to be displayed in any currency.
 * @param value Amount of eth to be displayed.
 * @param currency
 * @param dispalyDecimals
 * @returns
 */
export function inCurrency(value: BigNumber, currency: Currency, dispalyDecimals?: number): string | undefined {
	const { exchangeRates } = store.prices;
	if (!exchangeRates) {
		return;
	}
	const currencyConfig = currencyConfiguration[currency];
	const { prefix, getExchangeRate, decimals } = currencyConfig;
	const conversionDecimals = dispalyDecimals ?? decimals;
	let converted = value.mul(getExchangeRate(exchangeRates));
	let suffix = '';
	if (converted.gt(0) && converted.lt(10 ** -conversionDecimals)) {
		converted = converted.mul(10 ** conversionDecimals);
		suffix = `e-${conversionDecimals}`;
	}
	const amount = numberWithCommas(ethers.utils.formatUnits(converted, conversionDecimals));
	return `${prefix}${amount}${suffix}`;
}

export const formatTokens = (value: BigNumber, decimals = 5): string => {
	if (!value) {
		let formattedZero = '0.';
		for (let i = 0; i < decimals; i++) {
			formattedZero += '0';
		}
		return formattedZero;
	} else {
		if (value.gt(0) && value.lt(10 ** -decimals)) {
			return '< 0.00001';
		} else if (value.div(1e4).gt(1)) {
			decimals = 2;
		}
		return numberWithCommas(ethers.utils.formatUnits(value, 4));
	}
};

export const numberWithCommas = (x: string): string => {
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
};

export const formatWithoutExtraZeros = (amount: BigNumber, decimals = 6): string => {
	return ethers.utils.formatUnits(amount, decimals);
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
		return provider ? Network.networkFromId(parseInt(provider.chainId, 16)).symbol : undefined;
	} catch (e) {
		return undefined;
	}
};

export const unscale = (amount: BigNumber, decimals: number): BigNumber => amount.div(TEN.pow(decimals));
export const toHex = (amount: BigNumber): string => amount.toHexString();
export const minBalance = (decimals: number): BigNumber => BigNumber.from(`0.${'0'.repeat(decimals - 1)}1`);
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

/**
 * Retrieves the route based on the slug of the current window
 * If undefined, returns home
 * @param amount amount to be converted
 * @param decimals decimals the the converted amount will have
 */
export const getRouteBySlug = (slug: string | undefined, setts: SettStore): Route<RootStore> => {
	const sett = slug ? setts.getSettBySlug(slug) : null;
	if (!slug || !sett) return routes.home;

	switch (sett.state) {
		case SettState.Guarded:
			return routes.guarded;
		case SettState.Experimental:
			return routes.experimental;
		default:
			return routes.home;
	}
};
