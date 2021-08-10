import { Sett } from '../../../mobx/model/setts/sett';
import { fetchSettChartInformation } from '../../../mobx/utils/apiV2';
import { SettSnapshotGranularity } from '../../../mobx/model/setts/sett-snapshot';
import { SettChartData } from '../../../mobx/model/setts/sett-charts';

export enum SettChartTimeframe {
	'day' = 1,
	'week' = 7,
	'month' = 30,
}

export const fetchSettChart = async (sett: Sett, timeframe: SettChartTimeframe): Promise<SettChartData[] | null> => {
	const timeframeDays = 1 * timeframe;
	const to = new Date();
	const from = new Date();
	const isDayTimeFrame = timeframe === SettChartTimeframe.day;
	const granularity = isDayTimeFrame ? SettSnapshotGranularity.HOUR : SettSnapshotGranularity.DAY;

	from.setDate(to.getDate() - timeframeDays);

	const fetchedData = await fetchSettChartInformation(
		sett.vaultToken,
		from.toISOString(),
		to.toISOString(),
		granularity,
	);

	if (!fetchedData) {
		return null;
	}

	// data needs to be ascending sorted
	return fetchedData
		.sort((a, b) => a.timestamp - b.timestamp)
		.map((d) => ({ ...d, timestamp: new Date(d.timestamp) }));
};
