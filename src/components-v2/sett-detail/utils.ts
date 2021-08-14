import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Sett } from '../../mobx/model/setts/sett';
import { fetchSettChartInformation } from '../../mobx/utils/apiV2';
import { SettSnapshotGranularity } from '../../mobx/model/setts/sett-snapshot';
import { SettChartData } from '../../mobx/model/setts/sett-charts';

dayjs.extend(utc);

export enum SettChartTimeframe {
	'day' = 1,
	'week' = 7,
	'month' = 30,
}

export enum DelaySeverity {
	none = 'none',
	medium = 'medium',
	high = 'high',
}

/**
 * Fetches chart information since the provided timeframe until the current date
 * @param sett
 * @param timeframe
 */
export const fetchSettChart = async (sett: Sett, timeframe: SettChartTimeframe): Promise<SettChartData[] | null> => {
	const timeframeDays = 1 * timeframe;
	const isDayTimeFrame = timeframe === SettChartTimeframe.day;

	// if timeframe is just one day then we want the granularity to be hours
	const granularity = isDayTimeFrame ? SettSnapshotGranularity.HOUR : SettSnapshotGranularity.DAY;

	const now = dayjs().utc(); // query until current date
	const from = dayjs(now).subtract(timeframeDays, 'days').utc();

	const fetchedData = await fetchSettChartInformation(sett.vaultToken, from.toDate(), now.toDate(), granularity);

	if (!fetchedData) {
		return null;
	}

	// data needs to be ascending sorted
	return fetchedData
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((d) => ({ ...d, timestamp: new Date(d.timestamp) }));
};

export const calculateDelaySeverity = (delay: number): DelaySeverity => {
	if (delay >= 4) {
		return DelaySeverity.high;
	}

	if (delay >= 2) {
		return DelaySeverity.medium;
	}

	return DelaySeverity.none;
};

export const calculateDifferenceInHoursFromCycle = (cycle: Date): number => {
	return Math.abs(dayjs(cycle).diff(dayjs(), 'hours'));
};
