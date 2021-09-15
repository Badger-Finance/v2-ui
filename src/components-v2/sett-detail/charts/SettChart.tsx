import React from 'react';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { ChartMode, SettChartTimeframe } from '../../../mobx/model/setts/sett-charts';
import BaseAreaChart from './BaseAreaChart';
import { ChartModeTitles } from '../utils';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';

interface Props {
	mode: ChartMode;
	timeframe: SettChartTimeframe;
	data: ChartDataPoint[];
	width: number;
}

// the packages core fitWidth HOC does not support function components
// see: https://github.com/rrag/react-stockcharts/issues/370#issuecomment-336439030
class RawChartClass extends React.Component<Props> {
	render() {
		const { width, timeframe, data, mode } = this.props;

		const yScaleFormatterByMode: Record<string, (val: number) => string> = {
			[ChartMode.Value]: format('^$.3s'),
			[ChartMode.Ratio]: format('^.5f'),
			[ChartMode.AccountBalance]: format('^$.3s'),
		};

		const xSxcaleFormatter = timeframe === SettChartTimeframe.Day ? timeFormat('%H:%M') : timeFormat('%m-%d');
		const yScaleFormatter = yScaleFormatterByMode[mode];
		return (
			<BaseAreaChart
				title={ChartModeTitles[mode]}
				data={data}
				xFormatter={xSxcaleFormatter}
				yFormatter={yScaleFormatter}
				tooltipFormatter={timeFormat('%B %d, %Y')}
				width={width}
			/>
		);
	}
}

export const SettChart = fitWidth(RawChartClass);
