import React from 'react';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { format } from 'd3-format';
import BaseAreaChart from './BaseAreaChart';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';

interface Props {
	baseline: number;
	data: ChartDataPoint[];
	width: number;
}

// the packages core fitWidth HOC does not support function components
// see: https://github.com/rrag/react-stockcharts/issues/370#issuecomment-336439030
class RawChartClass extends React.Component<Props> {
	render() {
		const { width, baseline, data } = this.props;
		const yScaleFormatter = format('^.2%');
		return (
			<BaseAreaChart
				title={'Badger Boost APR'}
				data={data}
				yFormatter={yScaleFormatter}
				width={width}
				tooltipFormatter={(val) => `Boost Score: ${val}`}
				references={[{ value: baseline, label: `Baseline APR (${(baseline * 100).toFixed(2)}%)` }]}
			/>
		);
	}
}

export const BoostChart = fitWidth(RawChartClass);
