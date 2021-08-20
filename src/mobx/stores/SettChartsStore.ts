import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { SettChartData, SettChartTimeframe } from '../model/setts/sett-charts';
import { RootStore } from '../RootStore';
import { Sett } from '../model/setts/sett';
import { SettSnapshotGranularity } from '../model/setts/sett-snapshot';
import { fetchSettChartInformation } from '../utils/apiV2';

dayjs.extend(utc);

type SettChartInformation = SettChartData[] | null;
type ChartCacheByPeriod = Map<SettChartTimeframe, SettChartInformation>;
type SettCache = Map<Sett['underlyingToken'], ChartCacheByPeriod>;

export class SettChartsStore {
	private readonly store: RootStore;
	private readonly cache: SettCache = new Map();

	constructor(store: RootStore) {
		this.store = store;
	}

	/**
	 * Retrieves the charts data points from the provided sett within the provided timeframe
	 * @param sett
	 * @param timeframe
	 */
	async search(sett: Sett, timeframe: SettChartTimeframe): Promise<SettChartInformation> {
		const settCache = this.cache.get(sett.underlyingToken);

		if (!settCache) {
			const timeFrameCache = new Map();
			const data = await this.fetchSettChart(sett, timeframe);

			timeFrameCache.set(timeframe, data);
			this.cache.set(sett.underlyingToken, timeFrameCache);
			return data;
		}

		const timeFrameCache = settCache.get(timeframe);

		if (!timeFrameCache) {
			const data = await this.fetchSettChart(sett, timeframe);
			settCache.set(timeframe, data);
			return data;
		}

		return timeFrameCache;
	}

	private async fetchSettChart(sett: Sett, timeframe: SettChartTimeframe) {
		const { network } = this.store.network;

		const daysFromTimeFrame = {
			[SettChartTimeframe.day]: 1,
			[SettChartTimeframe.week]: 7,
			[SettChartTimeframe.month]: 30,
		};

		const timeframeDays = daysFromTimeFrame[timeframe];
		const isDayTimeFrame = timeframe === SettChartTimeframe.day;

		// if timeframe is just one day then we want the granularity to be hours
		const granularity = isDayTimeFrame ? SettSnapshotGranularity.HOUR : SettSnapshotGranularity.DAY;

		const now = dayjs().utc(); // query until current date
		const from = dayjs(now).subtract(timeframeDays, 'days').utc();

		const fetchedData = await fetchSettChartInformation({
			granularity,
			id: sett.vaultToken,
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
