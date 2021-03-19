import { PriceSummary, ProtocolSummary, Sett } from 'mobx/model';

export const getApi = () => {
	if (process.env.NODE_ENV === 'production') {
		return 'https://api.badger.finance/v2';
	}
	return 'https://staging-api.badger.finance/v2';
};
const badgerApi = getApi();

// api endpoints
const listSettsEndpoint = `${badgerApi}/setts`;
const listGeysersEndpoint = `${badgerApi}/geysers`;
const getPricesEndpoint = `${badgerApi}/prices`;
const getTVLEndpoint = `${badgerApi}/value`;

// api function calls
export const listSetts = async (chain?: string): Promise<Sett[] | null> => {
	const response = await fetch(`${listSettsEndpoint}${chain ? `?chain=${chain}` : ''}`);
	if (!response.ok) {
		return null;
	}
	return response.json();
};

export const listGeysers = async (chain?: string): Promise<Sett[] | null> => {
	const response = await fetch(`${listGeysersEndpoint}${chain ? `?chain=${chain}` : ''}`);
	if (!response.ok) {
		return null;
	}
	return response.json();
};

export const getTokenPrices = async (currency?: string): Promise<PriceSummary | null> => {
	const response = await fetch(`${getPricesEndpoint}${currency ? `?currency=${currency}` : ''}`);
	if (!response.ok) {
		return null;
	}
	return response.json();
};

export const getTotalValueLocked = async (network?: string): Promise<ProtocolSummary | null> => {
	const response = await fetch(`${getTVLEndpoint}?chain=${network ? network : 'eth'}`);
	if (!response.ok) {
		return null;
	}
	return response.json();
};

const coingeckoApi = 'https://api.coingecko.com/api/v3';

export const getCoinData = async (coin: string): Promise<any> => {
	return await fetch(`${coingeckoApi}/coins/${coin}`).then((response) => response.json());
};
