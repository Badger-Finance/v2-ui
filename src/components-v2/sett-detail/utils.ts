import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Sett } from '../../mobx/model/setts/sett';
import { fetchSettChartInformation } from '../../mobx/utils/apiV2';
import { SettSnapshotGranularity } from '../../mobx/model/setts/sett-snapshot';
import { ChartMode, SettChartData, SettChartTimeframe } from '../../mobx/model/setts/sett-charts';
import { Network } from '../../mobx/model/network/network';
import { DelaySeverity } from '../../mobx/model/setts/sett-rewards';

dayjs.extend(utc);

export const ChartModeTitles = {
	[ChartMode.value]: 'Sett Value',
	[ChartMode.ratio]: 'Token Ratio',
	[ChartMode.accountBalance]: 'Your Holdings',
};

const daysFromTimeFrame = {
	[SettChartTimeframe.day]: 1,
	[SettChartTimeframe.week]: 7,
	[SettChartTimeframe.month]: 30,
};

/**
 * Fetches chart information since the provided timeframe until the current date
 * @param sett
 * @param timeframe
 * @param network
 */
export const fetchSettChart = async (
	sett: Sett,
	network: Network,
	timeframe: SettChartTimeframe,
): Promise<SettChartData[] | null> => {
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
