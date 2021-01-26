import BigNumber from 'bignumber.js';

import { priceEndpoints } from '../../config/system/tokens';

export const graphQuery = (address: string) => {
	return priceEndpoints.map((endpoint: any) => {
		return fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				query: `{  
					token(id: "${address.toLowerCase()}") {
						id
						derivedETH
						symbol
						name
					}
					pair(id: "${address.toLowerCase()}") {
						id
						reserveETH
						totalSupply
						reserve0
						reserve1
						token0{
							id
							name
							symbol
							derivedETH
						  }
						   token1{
							id
							name
							symbol
							derivedETH
						  }
					}
				}`,
			}),
		}).then((response: any) => response.json());
	});
};
export const chefQueries = (pairs: any[], contracts: any[], growthEndpoint: string) => {
	return pairs.map((pair: any) => {
		return fetch(growthEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				query: `{
					masterChefs {
						pools(where: {id:"${contracts[pair].onsenId}"}) {
							allocPoint
							slpBalance
						}
						totalAllocPoint
					}
				}`,
			}),
		}).then((response: any) => response.json());
	});
};

export const jsonQuery = (url: string): Promise<Response> => {
	return fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	}).then((response: any) => response.json());
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
	return fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,btc', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
	}).then((response: any) => response.json());
};

export const growthQuery = (block: number): Promise<Response> => {
	return fetch(`https://api.thegraph.com/subgraphs/name/m4azey/badger-finance`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			query: `
			{
			vaults(block:{number:${block}}) {
				id, pricePerFullShare
			}
		}`,
		}),
	}).then((data) => data.json());
};

export const secondsToBlocks = (seconds: number) => {
	return seconds / (1 / (6500 / (24 * 60 * 60)));
};

let exchangeRates: any = { usd: 641.69, btc: 41.93 };
getExchangeRates().then((result: any) => (exchangeRates = result.ethereum));

// input: eth value in wei
// output: formatted currency string
export const inCurrency = (
	value: BigNumber,
	currency: string,
	hide = false,
	preferredDecimals = 5,
	noCommas = false,
	exponent = 18,
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
	}

	let suffix = '';

	// if (!noCommas)
	// 	if (normal.dividedBy(1e6).gt(1)) {
	// 		normal = normal.dividedBy(1e6)
	// 		decimals = 2
	// 		suffix = 'm'
	// 	} else if (normal.dividedBy(1e3).gt(1e2)) {
	// 		normal = normal.dividedBy(1e3)
	// 		decimals = 2
	// 		suffix = 'k'
	// 	} else
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

function numberWithCommas(x: string) {
	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}

export const fetchDiggChart = (chart: string, range: number, callback: (marketChart: any) => void) => {
	const to = new Date();
	const from = new Date();
	from.setDate(to.getDate() - range);

	fetch(
		`https://api.coingecko.com/api/v3/coins/digg/market_chart/range?vs_currency=usd&from=
		${from.getTime() / 1000}&to=${to.getTime() / 1000}`,
	)
		.then((data: any) => data.json())
		.then((marketData: any) => {
			const data = reduceMarketChart(marketData[chart], range, to, chart);
			const calcs = marketChartStats(data, 'close');
			callback({ from, to, data, calcs });
		});
};

const reduceMarketChart = (data: any[], range: number, maxDate: Date, chart: string) => {

	const formatted = data.map((value: any, index: number) => {
		const date = new Date();

		// if range less than 90 days, coingecko's data points are 1 hour apart.
		// otherwise, 1 day
		// in ascending order up to the max date requested
		if (range <= 90) date.setHours(maxDate.getHours() - (data.length - index));
		else date.setDate(maxDate.getDate() - (data.length - index));

		// let change = value[1]
		// if (chart === 'total_volumes') {
		// 	change = change / 1e9
		// }

		return {
			date: date,
			close: value[0],
			change: value[1],
		};
	});
	return formatted;
};

export function marketChartStats(dataSet: Array<any>, accessor: string) {
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
