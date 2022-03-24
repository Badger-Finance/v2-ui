import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { VaultChartData, VaultChartTimeframe } from '../model/vaults/vault-charts';
import { RootStore } from '../RootStore';
import { VaultSnapshotGranularity } from '../model/vaults/vault-snapshot';
import { fetchVaultChartInformation } from '../utils/apiV2';
import { VaultDTO } from '@badger-dao/sdk';

dayjs.extend(utc);

type VaultChartInformation = VaultChartData[] | null;
type ChartCacheByPeriod = Map<VaultChartTimeframe, VaultChartInformation>;
type VaultCache = Map<VaultDTO['underlyingToken'], ChartCacheByPeriod>;

export class VaultChartsStore {
	private readonly store: RootStore;
	private readonly cache: VaultCache = new Map();

	constructor(store: RootStore) {
		this.store = store;
	}

	/**
	 * Retrieves the charts data points from the provided vault within the provided timeframe
	 * @param vault
	 * @param timeframe
	 */
	async search(vault: VaultDTO, timeframe: VaultChartTimeframe): Promise<VaultChartInformation> {
		const vaultCache = this.cache.get(vault.underlyingToken);

		if (!vaultCache) {
			const timeFrameCache = new Map();
			const data = await this.fetchVaultChart(vault, timeframe);

			timeFrameCache.set(timeframe, data);
			this.cache.set(vault.underlyingToken, timeFrameCache);
			return data;
		}

		const timeFrameCache = vaultCache.get(timeframe);

		if (!timeFrameCache) {
			const data = await this.fetchVaultChart(vault, timeframe);
			vaultCache.set(timeframe, data);
			return data;
		}

		return timeFrameCache;
	}

	private async fetchVaultChart(vault: VaultDTO, timeframe: VaultChartTimeframe) {
		const { network } = this.store.network;

		const daysFromTimeFrame = {
			[VaultChartTimeframe.Day]: 1,
			[VaultChartTimeframe.Week]: 7,
			[VaultChartTimeframe.Month]: 30,
		};

		const timeframeDays = daysFromTimeFrame[timeframe];
		const isDayTimeFrame = timeframe === VaultChartTimeframe.Day;

		// if timeframe is just one day then we want the granularity to be hours
		const granularity = isDayTimeFrame ? VaultSnapshotGranularity.HOUR : VaultSnapshotGranularity.DAY;

		const now = dayjs().utc(); // query until current date
		const from = dayjs(now).subtract(timeframeDays, 'days').utc();

		const fetchedData = await fetchVaultChartInformation({
			granularity,
			id: vault.vaultToken,

			from: from.toDate(),
			to: now.toDate(),
			chain: network.symbol,
		});

		if (!fetchedData) {
			return null;
		}

		// data needs to be ascending sorted
		return fetchedData
			.sort((a, b) => a.timestamp - b.timestamp)
			.map((d) => ({ ...d, timestamp: new Date(d.timestamp) }));
	}
}
