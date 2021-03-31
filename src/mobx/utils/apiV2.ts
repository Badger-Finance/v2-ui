import { PriceSummary, ProtocolSummary, Sett, SponsorData, SyntheticData } from 'mobx/model';

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
	return fetch(`http://localhost:3000/v2/claw/emp/${empAddress}`).then((response) => response.json());
};

export const getClawEmpSponsor = async (empAddress: string, sponsorAddress: string): Promise<SponsorData> => {
	return await fetch(`http://localhost:3000/v2/claw/emp/${empAddress}/sponsor/${sponsorAddress}`).then((response) =>
		response.json(),
	);
};
