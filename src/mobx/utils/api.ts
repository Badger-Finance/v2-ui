// api badger functions

// TODO: Update to api.badger.finance on v2 migration
const getApi = () => {
	if (process.env.NODE_ENV === 'production') {
		return 'https://api.sett.vision';
	}
	return 'https://rn6p9w9x10.execute-api.us-west-1.amazonaws.com/staging';
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

// api util functions

export const formatUsd = (value: number): any => {
	const displayValue = parseFloat(value.toFixed(2));
	let display = '';
	if (displayValue > 1000000000) {
		display = `${(value / 1000000000).toFixed(2)}B`;
	} else if (displayValue > 1000000) {
		display = `${(value / 1000000).toFixed(2)}M`;
	} else if (displayValue > 1000) {
		display = `${(value / 1000).toFixed(2)}K`;
	} else {
		display = `${value.toFixed(2)}`;
	}
	return `$${display}`;
};

export const formatWithCommas = (x: any): any => {
	try {
		const x1 = x.toString().split('.')[0];
		const x2 = x.toString().split('.')[1];
		return `${x1.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${x2}`;
	} catch (e) {
		console.log(e);
		return x;
	}
};

// api badger functions

export const getBadgerRewards = async (data: string, address: string): Promise<any> => {
	return await fetch(
		`https://fzqm8i0owc.execute-api.us-east-1.amazonaws.com/prod/rewards/1/${data}/${address}`,
	).then((response) => response.json());
};
