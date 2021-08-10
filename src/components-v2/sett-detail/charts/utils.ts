import { Sett } from '../../../mobx/model/setts/sett';
import { fetchSettChartInformation } from '../../../mobx/utils/apiV2';
import { SettSnapshotGranularity } from '../../../mobx/model/setts/sett-snapshot';
import { SettChartData } from '../../../mobx/model/setts/sett-charts';

export enum SettChartTimeframe {
	'day' = 1,
	'week' = 7,
	'month' = 30,
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

	const to = new Date(); // query until current date
	const from = new Date();
	from.setDate(to.getDate() - timeframeDays);

	const fetchedData = await fetchSettChartInformation(sett.vaultToken, from, to, granularity);

	if (!fetchedData) {
		return null;
	}

	// data needs to be ascending sorted
	return fetchedData
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((d) => ({ ...d, timestamp: new Date(d.timestamp) }));
};
