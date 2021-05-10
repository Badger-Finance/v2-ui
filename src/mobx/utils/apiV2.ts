import {
	Eligibility,
	PriceSummary,
	ProtocolSummary,
	Sett,
	BouncerProof,
	Account,
	RewardMerkleClaim,
	LeaderBoardData,
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
const getPricesEndpoint = `${badgerApi}/prices`;
const getTVLEndpoint = `${badgerApi}/value`;
const checkShopEndpoint = `${badgerApi}/reward/shop`;
const getBouncerProofEndpoint = `${badgerApi}/reward/bouncer`;
const getAccountDetailsEndpoint = `${badgerApi}/accounts`;
const getClaimProofEndpoint = `${badgerApi}/reward/tree`;
const getLeaderBoardDataEndpoint = `${badgerApi}/leaderboards`;

// api function calls
export const listSetts = async (chain?: string): Promise<Sett[] | null> => {
	return fetchData(() => fetch(`${listSettsEndpoint}${chain ? `?chain=${chain}` : ''}`));
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

export const fetchClaimProof = async (address: string): Promise<RewardMerkleClaim | null> => {
	return fetchData(() => fetch(`${getClaimProofEndpoint}/${address}`));
};

export const fetchLeaderBoardData = async (page: number, size: number): Promise<LeaderBoardData | null> => {
	return fetchData(() => fetch(`${getLeaderBoardDataEndpoint}?page=${page}&size=${size}`));
};

const fetchData = async <T>(request: () => Promise<Response>): Promise<T | null> => {
	try {
		const response = await request();
		if (!response.ok) {
			return null;
		}
		// purposefully await to use try / catch
		return await response.json();
	} catch {
		return null;
	}
};
