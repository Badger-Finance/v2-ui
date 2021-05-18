import BigNumber from 'bignumber.js';
import { ExchangeRates } from 'mobx/model';
import { ZERO } from '../../config/constants';

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

export const getExchangeRates = (): Promise<Response> => {
	return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,cad,btc,bnb', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	}).then((response: any) => response.json());
};

export const getBdiggExchangeRates = async (): Promise<Response> => {
	return fetch(
		'https://api.coingecko.com/api/v3/simple/price/?ids=badger-sett-digg&vs_currencies=usd,eth,btc,cad,bnb',
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
		},
	).then((response: any) => response.json());
};

export const secondsToBlocks = (seconds: number): number => {
	return seconds / (1 / (6500 / (24 * 60 * 60)));
};

export let exchangeRates: ExchangeRates = { usd: 641.69, cad: 776.44, btc: 41.93, bnb: 7.2 };
getExchangeRates().then((result: any) => (exchangeRates = result.ethereum));
export let bDiggExchangeRates = { usd: 50405, eth: 30.725832, btc: 0.9456756, cad: 63346 };
getBdiggExchangeRates().then((result: any) => (bDiggExchangeRates = result['badger-sett-digg']));

// TECH DEBT: Reformat these formatting functions using a factory pattern and delete repeated code

// input: usd value
// output: formatted currency string
export const usdToCurrency = (
	value: BigNumber,
	currency: string,
	hide = false,
	preferredDecimals = 2,
	noCommas = false,
): string => {
	if (!value || value.isNaN()) return inCurrency(new BigNumber(0), currency, hide, preferredDecimals);

	let normal = value;
	let prefix = !hide ? '$' : '';
	let decimals = preferredDecimals;

	switch (currency) {
		case 'usd':
			break;
		case 'btc':
			normal = normal.dividedBy(exchangeRates.usd).multipliedBy(exchangeRates.btc);
			decimals = 5;
			prefix = '₿ ';
			break;
		case 'eth':
			prefix = 'Ξ ';
			decimals = 5;
			normal = normal.dividedBy(exchangeRates.usd);
			break;
		case 'cad':
			normal = normal.dividedBy(exchangeRates.usd).multipliedBy(exchangeRates.cad);
			prefix = 'C$';
			break;
		case 'bnb':
			normal = normal.dividedBy(exchangeRates.usd).multipliedBy(exchangeRates.bnb);
			decimals = 5;
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

// input: eth value in wei
// output: formatted currency string
export const inCurrency = (
	value: BigNumber,
	currency: string,
	hide = false,
	preferredDecimals = 5,
	noCommas = false,
): string => {
	if (!value || value.isNaN()) return inCurrency(new BigNumber(0), currency, hide, preferredDecimals);

	let normal = value;
	let prefix = !hide ? 'Ξ ' : '';
	let decimals = preferredDecimals;

	switch (currency) {
		case 'eth':
			break;
		case 'btc':
			normal = normal.multipliedBy(exchangeRates.btc);
			prefix = '₿ ';
			break;
		case 'usd':
			prefix = '$';
			decimals = 2;
			normal = normal.multipliedBy(exchangeRates.usd);
			break;
		case 'cad':
			normal = normal.multipliedBy(exchangeRates.cad);
			prefix = 'C$';
			decimals = 2;
			break;
		case 'bnb':
			normal = normal.multipliedBy(exchangeRates.bnb);
			prefix = '/assets/icons/bnb-white.png';
			decimals = 2;
			break;
	}

	let suffix = '';

	if (normal.gt(0) && normal.lt(10 ** -preferredDecimals)) {
		normal = normal.multipliedBy(10 ** preferredDecimals);
		decimals = preferredDecimals;
		suffix = `e-${preferredDecimals}`;
	} else if (normal.dividedBy(1e4).gt(1)) {
		decimals = 2;
	}

	const fixedNormal = noCommas
		? normal.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR)
		: numberWithCommas(normal.toFixed(decimals, BigNumber.ROUND_HALF_FLOOR));

	return `${prefix}${fixedNormal}${suffix}`;
};

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
	hide = false,
	preferredDecimals = 2,
	noCommas = false,
}: DiggToCurrencyOptions): string => {
	if (!amount || amount.isNaN()) return inCurrency(new BigNumber(0), currency, hide, preferredDecimals);

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
			normal = normal.multipliedBy(exchangeRates.cad);
			decimals = 2;
			prefix = 'C$';
			break;
		case 'bnb':
			normal = normal.multipliedBy(exchangeRates.bnb);
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

export const fetchDiggChart = (chart: string, range: number, callback: (marketChart: any) => void): void => {
	const to = new Date();
	const from = new Date();
	from.setDate(to.getDate() - range);

	fetch(
		`https://api.coingecko.com/api/v3/coins/digg/market_chart/range?vs_currency=usd&from=
		${from.getTime() / 1000}&to=${to.getTime() / 1000}`,
	)
		.then((data: any) => data.json())
		.then((marketData: any) => {
			const data = reduceMarketChart(marketData[chart], range, to);
			const calcs = marketChartStats(data, 'close');
			callback({ from, to, data, calcs });
		});
};

const reduceMarketChart = (data: any[], range: number, maxDate: Date) => {
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

export function marketChartStats(
	dataSet: Array<any>,
	accessor: string,
): { high: number; low: number; avg: number; median: number } {
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

export const toHex = (amount: BigNumber): string => '0x' + amount.toString(16);
