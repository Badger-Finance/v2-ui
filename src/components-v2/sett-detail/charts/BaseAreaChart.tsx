import { makeStyles, useTheme } from '@material-ui/core';
import { ChartDataPoint } from 'mobx/model/charts/chart-data-point';
import React from 'react';
import { AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, ReferenceLine } from 'recharts';

const useStyles = makeStyles(() => ({
	chartContainer: {
		color: '#000000',
	},
	references: {
		color: '#FFFFFF',
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
	customTooltip?: React.ReactElement;
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
	customTooltip,
	tooltipFormatter,
	data,
	references,
}: Props): JSX.Element => {
	const classes = useStyles();

	/**
	 * Derive default width and height for the rechart canvas.
	 * Recharts only requires one dimension to render, the other can be set
	 * to a relative sizing of the containing div. Width is derived from height
	 * when not available, and vice versa.
	 *
	 * This base component supports four scenarios:
	 *   - no width / height
	 *   - width or height
	 *   - width and height
	 *
	 * Examples: w: width h: height dw: defaultWidth dh: defaultHeight
	 * w = undefined, h = undefined => 400x400 (dw: 400, dh: 400)
	 * w = 300, h = undefined => 300 x '100%' (dw: 400, dh: 100%)
	 * w = 300, h = 200 => 300 x 200 (dw: '100%, dh: '100%)
	 * w = undefined, h = 200 => '100%' x 200 (dw: '100%', dh: 400)
	 *
	 * The container is then sized based on the provided width or height,
	 * and falls back to the derived default width or height if none was given.
	 */
	const defaultWidth = height ? '100%' : 400;
	const defaultHeight = width ? '100%' : 400;

	const formatTooltip = (value: number): string[] => {
		return [yFormatter ? yFormatter(value) : value.toFixed(), title];
	};

	const theme = useTheme();

	return (
		<ResponsiveContainer
			width={width ?? defaultWidth}
			height={height ?? defaultHeight}
			aspect={1}
			className={classes.chartContainer}
		>
			<AreaChart data={data}>
				<defs>
					<linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.5} />
						<stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.05} />
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
					content={customTooltip}
					formatter={formatTooltip}
					labelFormatter={tooltipFormatter}
					itemStyle={{ color: 'black' }}
					separator={': '}
					cursor={{ stroke: theme.palette.primary.main, strokeWidth: 2 }}
				/>
				{references &&
					references.map((r, i) => (
						<ReferenceLine
							key={i}
							y={r.value}
							label={{ value: r.label, fill: 'white', position: 'insideTopRight' }}
							stroke="gray"
							strokeDasharray="3 3"
						/>
					))}
				<Area
					type="monotone"
					dataKey="y"
					stroke={theme.palette.primary.main}
					fillOpacity={1}
					fill="url(#gradient)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default BaseAreaChart;
