import { Eligibility, PriceSummary, ProtocolSummary, Sett, SponsorData, SyntheticData } from 'mobx/model';

export const getApi = (): string => {
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
const checkShopEndpoint = `${badgerApi}/reward/shop`;

// api function calls
export const listSetts = async (chain?: string): Promise<Sett[] | null> => {
	return fetchData(() => fetch(`${listSettsEndpoint}${chain ? `?chain=${chain}` : ''}`));
};

export const listGeysers = async (chain?: string): Promise<Sett[] | null> => {
	return fetchData(() => fetch(`${listGeysersEndpoint}${chain ? `?chain=${chain}` : ''}`));
};

export const getTokenPrices = async (chain?: string, currency?: string): Promise<PriceSummary | null> => {
	return fetchData(() =>
		fetch(`${getPricesEndpoint}?currency=${currency ? currency : 'eth'}&chain=${chain ? chain : 'eth'}`),
	);
};

export const getTotalValueLocked = async (network?: string): Promise<ProtocolSummary | null> => {
	return fetchData(() => fetch(`${getTVLEndpoint}?chain=${network ? network : 'eth'}`));
};

export const checkShopEligibility = async (address: string): Promise<Eligibility | null> => {
	return fetchData(() => fetch(`${checkShopEndpoint}/${address}`));
};

const fetchData = async <T>(request: () => Promise<Response>): Promise<T | null> => {
	try {
		const response = await request();
		if (!response.ok) {
			return null;
		}
		return response.json();
	} catch {
		return null;
	}
};

export const getClawEmp = async (empAddress: string): Promise<SyntheticData> => {
	return fetch(
		`https://7dt9vo796h.execute-api.us-west-1.amazonaws.com/staging/v2/claw/emp/${empAddress}`,
	).then((response) => response.json());
};

export const getClawEmpSponsor = async (empAddress: string, sponsorAddress: string): Promise<SponsorData> => {
	return await fetch(
		`https://7dt9vo796h.execute-api.us-west-1.amazonaws.com/staging/v2/claw/emp/${empAddress}/sponsor/${sponsorAddress}`,
	).then((response) => response.json());
};
