import { ChartGranularity, VaultDTO, VaultSnapshot } from '@badger-dao/sdk';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { VaultChartTimeframe } from '../model/vaults/vault-charts';
import { RootStore } from './RootStore';

dayjs.extend(utc);

type ChartCacheByPeriod = Map<VaultChartTimeframe, VaultSnapshot[]>;
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
	async search(vault: VaultDTO, timeframe: VaultChartTimeframe): Promise<VaultSnapshot[]> {
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

	private async fetchVaultChart(vault: VaultDTO, timeframe: VaultChartTimeframe): Promise<VaultSnapshot[]> {
		const {
			config: { network },
		} = this.store.sdk;

		const daysFromTimeFrame = {
			[VaultChartTimeframe.Day]: 1,
			[VaultChartTimeframe.Week]: 7,
			[VaultChartTimeframe.Month]: 30,
		};

		const timeframeDays = daysFromTimeFrame[timeframe];
		const isDayTimeFrame = timeframe === VaultChartTimeframe.Day;

		// if timeframe is just one day then we want the granularity to be hours
		const granularity = isDayTimeFrame ? ChartGranularity.HOUR : ChartGranularity.DAY;

		const now = dayjs().utc(); // query until current date
		const from = dayjs(now).subtract(timeframeDays, 'days').utc();

		const fetchedData = await this.store.sdk.api.loadCharts(
			{
				granularity,
				vault: vault.vaultToken,

				start: from.toDate().toISOString(),
				end: now.toDate().toISOString(),
			},
			network,
		);

		if (!fetchedData) {
			return [];
		}

		// data needs to be ascending sorted
		return fetchedData.sort((a, b) => a.timestamp - b.timestamp);
	}
}
