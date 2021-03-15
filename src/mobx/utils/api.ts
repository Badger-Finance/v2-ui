// api badger functions

import { Network } from '../model';

export const getApi = (network: string | undefined) => {
	switch (network) {
		// TODO: Add BSC / Matic endpoints
		default:
			if (process.env.NODE_ENV === 'production') {
				return 'https://api.badger.finance';
			}
			return 'https://staging-api.badger.finance';
	}
};
// const badgerApi = getApi(getNetworkName());

export const getAssetsUnderManagement = (network: Network): any => {
	return fetch(`${getApi(network.name)}/protocol/value?tokens=true`).then((response) => response.json());
};

// Geyser Data
export const getFarmData = async (network: Network): Promise<any> => {
	return await fetch(`${getApi(network.name)}/protocol/farm`).then((response) => response.json());
};

export const getPpfs = async (network: Network): Promise<any> => {
	return await fetch(`${getApi(network.name)}/protocol/ppfs`).then((response) => response.json());
};

export const getAssetPerformances = (setts: Array<any>, network: Network): Promise<any> => {
	const performanceData = setts.map(async (sett: any) => {
		const assetKey = sett.asset.toLowerCase();
		return {
			...sett,
			asset: assetKey,
			title: sett.title,
			...(await getAssetPerformance(assetKey, network)),
		};
	});
	return Promise.all(performanceData);
};

const getAssetPerformance = async (asset: any, network: Network): Promise<any> => {
	return await fetch(`${getApi(network.name)}/protocol/sett/${asset}/performance`).then((response) =>
		response.json(),
	);
};

export const getAssetPerformanceCharts = async (setts: Array<any>, network: Network): Promise<any> => {
	const performanceData = setts.map(async (sett: any) => {
		const assetKey = sett.asset.toLowerCase();
		return {
			asset: assetKey,
			title: sett.title,
			data: await getPerformanceChartData(assetKey, network),
		};
	});
	return await Promise.all(performanceData);
};

const getPerformanceChartData = async (asset: any, network: Network): Promise<any> => {
	return await fetch(`${getApi(network.name)}/chart/sett/${asset}/performance?count=350`).then((response) =>
		response.json(),
	);
};

export const getSettCharts = async (setts: Array<any>, network: Network): Promise<any> => {
	const jarData = setts.map(async (sett) => {
		const assetKey = sett.asset.toLowerCase();
		return {
			title: sett.title,
			asset: assetKey,
			data: await getSettChartData(assetKey, network),
		};
	});
	return await Promise.all(jarData);
};

const getSettChartData = async (asset: any, network: Network): Promise<any> => {
	return await fetch(`${getApi(network.name)}/chart/sett/${asset}?count=1000`).then((response) => response.json());
};

export const getUserAccount = async (address: string, network: Network): Promise<any> => {
	return await fetch(`${getApi(network.name)}/protocol/earnings/${address}`).then((response) => response.json());
};

// api coingecko functions

const coingeckoApi = 'https://api.coingecko.com/api/v3';

export const getCoinData = async (coin: string): Promise<any> => {
	return await fetch(`${coingeckoApi}/coins/${coin}`).then((response) => response.json());
};

export const getEthPrice = async (coin: string): Promise<any> => {
	return await fetch(`${coingeckoApi}/coins/${coin}`)
		.then((response) => response.json())
		.then((jsonResponse) => jsonResponse['market_data']['current_price']['usd']);
};

// api util functions

export const formatUsd = (x: number): string => {
	try {
		const valueParts = x.toString().split('.');
		let value = valueParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		if (valueParts.length > 1) {
			value += '.' + valueParts[1].substring(0, 2);
		}
		return value;
	} catch (e) {
		console.log(e);
		return x.toString();
	}
};

export const formatWithCommas = (x: number): string => {
	try {
		const valueParts = x.toString().split('.');
		let value = valueParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		if (valueParts.length > 1) {
			value += '.' + valueParts[1].substring(0, 5);
		}
		return value;
	} catch (e) {
		console.log(e);
		return x ? x.toString() : '0.00';
	}
};

// api badger functions

export const getBadgerRewards = async (data: string, address: string): Promise<any> => {
	return await fetch(
		`https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod/rewards/1/${data}/${address}`,
	).then((response) => response.json());
};
