import { Chart, ChartCanvas } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { createVerticalLinearGradient, hexToRGBA } from 'react-stockcharts/lib/utils';

import { AreaSeries } from 'react-stockcharts/lib/series';
import { CurrentCoordinate } from 'react-stockcharts/lib/coordinates';
import PropTypes from 'prop-types';
import React from 'react';
import { curveLinear } from 'd3-shape';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { scaleTime } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

const canvasGradient = createVerticalLinearGradient([{ stop: 0, color: hexToRGBA('#F2A52B', 0.0) }]);

function AreaChart(props: any) {
	const gradientId = 'gradient-' + Math.floor(Math.random() * 100);

	return (
		!!props.chartData && (
			<ChartCanvas
				ratio={5 / 4}
				width={props.width}
				height={350}
				type="svg"
				margin={{ left: 45, right: 30, top: 0, bottom: 30 }}
				seriesName={gradientId}
				data={props.chartData.data}
				xAccessor={(d: any) => d.date}
				xScale={scaleTime()}
				xExtents={[props.chartData.from, props.chartData.to]}
				displayXAccessor={(d: any) => {
					return d.date;
				}}
			>
				<Chart id={0} yExtents={(d: any) => d.change}>
					<defs>
						<linearGradient id={gradientId} x1="0" y1="100%" x2="0" y2="0%">
							<stop offset="0%" stopColor="#F2A52B" stopOpacity={0} />
							<stop offset="100%" stopColor={'#F2A52B'} stopOpacity={0.4} />
						</linearGradient>
					</defs>
					<CurrentCoordinate yAccessor={(d: any) => d.change} displayFormat={timeFormat('%Y-%m-%d')} r={4} />
					<XAxis axisAt="bottom" orient="bottom" ticks={5} stroke="#aaa" tickStroke="#fff" />
					<YAxis
						stroke="#aaa"
						tickStroke="#fff"
						axisAt="left"
						orient="left"
						tickFormat={(value: number) => {
							return (props.yPrefix || '') + intToString(value);
						}}
					/>
					<AreaSeries
						yAccessor={(d: any) => d.change}
						fill={`url(#${gradientId})`}
						strokeWidth={1}
						stroke={props.accent}
						interpolation={curveLinear}
						canvasGradient={canvasGradient}
					/>
				</Chart>
			</ChartCanvas>
		)
	);
}

AreaChart.propTypes = {
	width: PropTypes.number.isRequired,
	accent: PropTypes.string.isRequired,
	data: PropTypes.object.isRequired,
};

export default fitWidth(AreaChart);

const intToString = (n: number) => {
	if (n < 1e3) return n;
	if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'k';
	if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'm';
	if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
	if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
};
