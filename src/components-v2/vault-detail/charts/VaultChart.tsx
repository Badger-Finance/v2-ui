import React from 'react';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { ChartMode, VaultChartTimeframe } from '../../../mobx/model/vaults/vault-charts';
import BaseAreaChart from './BaseAreaChart';
import { ChartModeTitles } from '../utils';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';

interface Props {
	mode: ChartMode;
	timeframe: VaultChartTimeframe;
	data: ChartDataPoint[] | null;
}

export const VaultChart = (props: Props): JSX.Element | null => {
	const { timeframe, data, mode } = props;

	if (!data) {
		return null;
	}

	const yScaleFormatterByMode: Record<string, (val: number) => string> = {
		[ChartMode.Value]: format('^$.3s'),
		[ChartMode.Ratio]: format('^.5f'),
		[ChartMode.AccountBalance]: format('^$.3s'),
	};

	const xSxcaleFormatter = timeframe === VaultChartTimeframe.Day ? timeFormat('%H:%M') : timeFormat('%m-%d');
	const yScaleFormatter = yScaleFormatterByMode[mode];
	return (
		<BaseAreaChart
			title={ChartModeTitles[mode]}
			data={data}
			xFormatter={xSxcaleFormatter}
			yFormatter={yScaleFormatter}
			tooltipFormatter={timeFormat('%B %d, %Y')}
			width="99%" // needs to be 99% see https://github.com/recharts/recharts/issues/172#issuecomment-307858843
		/>
	);
};
