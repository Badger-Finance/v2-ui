import {
	Eligibility,
	PriceSummary,
	ProtocolSummary,
	Sett,
	BouncerProof,
	Account,
	SponsorData,
	SyntheticData,
} from 'mobx/model';

export const getApi = (): string => {
	if (process.env.REACT_APP_BUILD_ENV === 'production') {
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
const getBouncerProofEndpoint = `${badgerApi}/reward/bouncer`;
const getAccountDetailsEndpoint = `${badgerApi}/accounts`;

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

export const fetchBouncerProof = async (address: string): Promise<BouncerProof | null> => {
	return fetchData(() => fetch(`${getBouncerProofEndpoint}/${address}`));
};

export const getAccountDetails = async (address: string, chain?: string): Promise<Account | null> => {
	return fetchData(() => fetch(`${getAccountDetailsEndpoint}/${address}?chain=${chain ? chain : 'eth'}`));
};

export const fetchClawEmp = async (empAddress: string): Promise<SyntheticData | null> => {
	return fetchData(() =>
		fetch(`https://fcoaf74n99.execute-api.us-west-1.amazonaws.com/staging/v2/claw/emp/${empAddress}`),
	);
};

export const fetchClawEmpSponsor = async (empAddress: string, sponsorAddress: string): Promise<SponsorData | null> => {
	return fetchData(() =>
		fetch(
			`https://fcoaf74n99.execute-api.us-west-1.amazonaws.com/staging/v2/claw/emp/${empAddress}/sponsor/${sponsorAddress}`,
		),
	);
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
