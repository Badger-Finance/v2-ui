import { makeStyles } from '@material-ui/core';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';
import React from 'react';
import { AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, ReferenceLine } from 'recharts';

const useStyles = makeStyles(() => ({
	chartContainer: {
		color: '#000000',
	},
}));

export interface Reference {
	value: number;
	label?: string;
}

interface Props {
	title: string;
	width?: number | string;
	height?: number | string;
	yTitle?: string;
	xTitle?: string;
	yFormatter?: (value: number) => string;
	xFormatter?: (value: number) => string;
	tooltipFormatter?: (value: number) => string;
	data: ChartDataPoint[];
	references?: Reference[];
}

const BaseAreaChart = ({
	title,
	width,
	height,
	yFormatter,
	xFormatter,
	tooltipFormatter,
	data,
	references,
}: Props): JSX.Element => {
	const classes = useStyles();
	const defaultWidth = height ? '100%' : 400;
	const defaultHeight = width ? '100%' : 400;

	const formatTooltip = (value: number): string[] => {
		return [yFormatter ? yFormatter(value) : value.toFixed(), title];
	};

	return (
		<ResponsiveContainer
			width={width ?? defaultWidth}
			height={height ?? defaultHeight}
			className={classes.chartContainer}
		>
			<AreaChart data={data}>
				<defs>
					<linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#F2A52B" stopOpacity={0.5} />
						<stop offset="95%" stopColor="#F2A52B" stopOpacity={0.05} />
					</linearGradient>
				</defs>
				<XAxis
					dataKey="x"
					type="number"
					domain={['dataMin', 'dataMax']}
					tickFormatter={xFormatter}
					tick={{ fill: 'white' }}
					tickCount={Math.max(7, data.length / 3)}
				/>
				<YAxis type="number" domain={['auto', 'auto']} tickFormatter={yFormatter} tick={{ fill: 'white' }} />
				<Tooltip
					formatter={formatTooltip}
					labelFormatter={tooltipFormatter}
					separator={': '}
					cursor={{ stroke: '#F2A52B', strokeWidth: 2 }}
				/>
				{references &&
					references.map((r, i) => (
						<ReferenceLine key={i} y={r.value} label={r.label} stroke="gray" strokeDasharray="3 3" />
					))}
				<Area type="monotone" dataKey="y" stroke="#F2A52B" fillOpacity={1} fill="url(#gradient)" />
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default BaseAreaChart;
