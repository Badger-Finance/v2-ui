// api badger functions

export const getApi = () => {
	if (process.env.NODE_ENV === 'production') {
		return 'https://api.badger.finance';
	}
	return 'https://staging-api.badger.finance';
};
const badgerApi = getApi();

export const getAssetsUnderManagement = (): any => {
	return fetch(`${badgerApi}/protocol/value?tokens=true`).then((response) => response.json());
};

// Geyser Data
export const getFarmData = async (): Promise<any> => {
	return await fetch(`${badgerApi}/protocol/farm`).then((response) => response.json());
};

export const getPpfs = async (): Promise<any> => {
	return await fetch(`${badgerApi}/protocol/ppfs`).then((response) => response.json());
};

export const getAssetPerformances = (setts: Array<any>): Promise<any> => {
	const performanceData = setts.map(async (sett: any) => {
		const assetKey = sett.asset.toLowerCase();
		return {
			...sett,
			asset: assetKey,
			title: sett.title,
			...(await getAssetPerformance(assetKey)),
		};
	});
	return Promise.all(performanceData);
};

const getAssetPerformance = async (asset: any): Promise<any> => {
	return await fetch(`${badgerApi}/protocol/sett/${asset}/performance`).then((response) => response.json());
};

export const getAssetPerformanceCharts = async (setts: Array<any>): Promise<any> => {
	const performanceData = setts.map(async (sett: any) => {
		const assetKey = sett.asset.toLowerCase();
		return {
			asset: assetKey,
			title: sett.title,
			data: await getPerformanceChartData(assetKey),
		};
	});
	return await Promise.all(performanceData);
};

const getPerformanceChartData = async (asset: any): Promise<any> => {
	return await fetch(`${badgerApi}/chart/sett/${asset}/performance?count=350`).then((response) => response.json());
};

export const getSettCharts = async (setts: Array<any>): Promise<any> => {
	const jarData = setts.map(async (sett) => {
		const assetKey = sett.asset.toLowerCase();
		return {
			title: sett.title,
			asset: assetKey,
			data: await getSettChartData(assetKey),
		};
	});
	return await Promise.all(jarData);
};

const getSettChartData = async (asset: any): Promise<any> => {
	return await fetch(`${badgerApi}/chart/sett/${asset}?count=1000`).then((response) => response.json());
};

export const getUserAccount = async (address: string): Promise<any> => {
	return await fetch(`${badgerApi}/protocol/earnings/${address}`).then((response) => response.json());
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
