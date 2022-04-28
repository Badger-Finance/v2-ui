import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { VaultChartFetchParams, VaultSnapshot, VaultSnapshotGranularity } from '../model/vaults/vault-snapshot';
import { DEBUG } from 'config/environment';
import { Network } from '@badger-dao/sdk';

export const getApi = (): string => {
	if (DEBUG) {
		return 'https://staging-api.badger.com/v2';
	}
	return 'https://api.badger.com/v2';
};
export const BADGER_API = getApi();

// api endpoints
const getClaimProofEndpoint = `${BADGER_API}/reward/tree`;
const getVaultChartInformationEndpoint = `${BADGER_API}/charts`;

// api function calls

export const fetchClaimProof = async (address: string, chain = Network.Ethereum): Promise<RewardMerkleClaim | null> => {
	const fetchChain = chain === Network.Local ? Network.Ethereum : chain;
	return fetchData(() => fetch(`${getClaimProofEndpoint}/${address}?chain=${fetchChain}`));
};

export const fetchVaultChartInformation = async ({
	id,
	chain = Network.Ethereum,
	from,
	to,
	granularity = VaultSnapshotGranularity.DAY,
}: VaultChartFetchParams): Promise<VaultSnapshot[] | null> => {
	const params = new URLSearchParams({ id, granularity, chain });

	if (from) {
		params.set('start', from.toISOString());
	}

	if (to) {
		params.set('end', to.toISOString());
	}

	return fetchData(() => fetch(`${getVaultChartInformationEndpoint}?${params.toString()}`));
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
