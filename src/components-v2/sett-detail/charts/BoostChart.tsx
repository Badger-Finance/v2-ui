import React from 'react';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { format } from 'd3-format';
import BaseAreaChart from './BaseAreaChart';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { TooltipProps } from 'recharts';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	tooltipContainer: {
		background: 'white',
		padding: theme.spacing(2),
		display: 'flex',
		flexDirection: 'column',
	},
}));

const yScaleFormatter = format('^.2%');

const BoostTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
	const classes = useStyles();
	if (!active || !payload || payload.length === 0) {
		return null;
	}
	const { x, y } = payload[0].payload;
	const stakeRatio = `${(x / 20).toFixed(2)}%`;
	return (
		<div className={classes.tooltipContainer}>
			<span>Badger Boost: {label}</span>
			<span>Stake Ratio: {stakeRatio}</span>
			<span>Boosted APR: {yScaleFormatter(y)}</span>
		</div>
	);
};

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

		return (
			<BaseAreaChart
				title={'Badger Boost APR'}
				data={data}
				yFormatter={yScaleFormatter}
				width={width}
				customTooltip={<BoostTooltip />}
				references={[{ value: baseline, label: `Baseline APR (${(baseline * 100).toFixed(2)}%)` }]}
			/>
		);
	}
}

export const BoostChart = fitWidth(RawChartClass);
