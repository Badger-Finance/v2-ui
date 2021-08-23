import { TokenConfigRecord } from 'mobx/model/tokens/token-config-record';
import { Account } from '../model/account/account';
import { Sett } from '../model/setts/sett';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { BouncerProof } from '../model/rewards/bouncer-proof';
import { Eligibility } from '../model/rewards/eligibility';
import { LeaderBoardBadger } from '../model/boost/leader-board-badger';
import { LeaderBoardData } from '../model/boost/leaderboard-data';
import { ProtocolSummary } from '../model/system-config/protocol-summary';
import { PriceSummary } from '../model/system-config/price-summary';
import { SettChartFetchParams, SettSnapshot, SettSnapshotGranularity } from '../model/setts/sett-snapshot';
import { DEBUG } from 'config/environment';

export const getApi = (): string => {
	if (DEBUG) {
		return 'https://staging-api.badger.finance/v2';
	}
	return 'https://api.badger.finance/v2';
};
const badgerApi = getApi();

// api endpoints
const listSettsEndpoint = `${badgerApi}/setts`;
const getTokensEndpoint = `${badgerApi}/tokens`;
const getPricesEndpoint = `${badgerApi}/prices`;
const getTVLEndpoint = `${badgerApi}/value`;
const checkShopEndpoint = `${badgerApi}/reward/shop`;
const getBouncerProofEndpoint = `${badgerApi}/reward/bouncer`;
const getAccountDetailsEndpoint = `${badgerApi}/accounts`;
const getClaimProofEndpoint = `${badgerApi}/reward/tree`;
const getLeaderBoardDataEndpoint = `${badgerApi}/leaderboards`;
const getSettChartInformationEndpoint = `${badgerApi}/charts`;

// api function calls
export const listSetts = async (chain?: string): Promise<Sett[] | null> => {
	return fetchData(() => fetch(`${listSettsEndpoint}${chain ? `?chain=${chain}` : ''}`));
};

export const getTokens = async (chain?: string): Promise<TokenConfigRecord | null> => {
	return fetchData(() => fetch(`${getTokensEndpoint}${chain ? `?chain=${chain}` : ''}`));
};

export const getTokenPrices = async (chain?: string, currency?: string): Promise<PriceSummary | null> => {
	return fetchData(() =>
		fetch(`${getPricesEndpoint}?currency=${currency ? currency : 'eth'}&chain=${chain ? chain : 'eth'}`),
	);
};

export const getTotalValueLocked = async (network?: string): Promise<ProtocolSummary | null> => {
	return fetchData(() => fetch(`${getTVLEndpoint}?chain=${network ? network : 'eth'}&currency=eth`));
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

export const fetchCompleteLeaderBoardData = async (): Promise<LeaderBoardBadger[] | null> => {
	return fetchData(() => fetch(`${getLeaderBoardDataEndpoint}/complete`));
};

export const fetchSettChartInformation = async ({
	id,
	chain = 'eth',
	from,
	to,
	granularity = SettSnapshotGranularity.DAY,
}: SettChartFetchParams): Promise<SettSnapshot[] | null> => {
	const params = new URLSearchParams({ id, granularity, chain });

	if (from) {
		params.set('start', from.toISOString());
	}

	if (to) {
		params.set('end', to.toISOString());
	}

	return fetchData(() => fetch(`${getSettChartInformationEndpoint}?${params.toString()}`));
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
