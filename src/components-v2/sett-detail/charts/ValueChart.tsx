import React from 'react';
import { Chart, ChartCanvas } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { AreaSeries } from 'react-stockcharts/lib/series';
import { createVerticalLinearGradient, hexToRGBA } from 'react-stockcharts/lib/utils';
import { scaleTime } from 'd3-scale';
import { curveLinear } from 'd3-shape';
import { fitWidth } from 'react-stockcharts/lib/helper';
import chartMockData from './chart-mock-data.json';

const canvasGradient = createVerticalLinearGradient([{ stop: 0, color: hexToRGBA('#F2A52B', 0.0) }]);
const chartData = chartMockData.map((mock) => ({ ...mock, date: new Date(mock.date) }));

// this library does not have any types :/
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const RawChart = ({ width }: any): JSX.Element | null => {
	return (
		<ChartCanvas
			ratio={5 / 4}
			width={width}
			height={365}
			seriesName={'value-gradient'}
			margin={{ left: 45, right: 30, top: 8, bottom: 30 }}
			type="svg"
			data={chartData}
			xAccessor={(d: any) => d.date}
			xScale={scaleTime()}
			xExtents={[new Date(2011, 0, 1), new Date(2013, 0, 2)]}
		>
			<Chart id={0} yExtents={(d: any) => d.close}>
				<defs>
					<linearGradient id="value-gradient" x1="0" y1="100%" x2="0" y2="0%">
						<stop offset="0%" stopColor="#F2A52B" stopOpacity={0} />
						<stop offset="100%" stopColor="#F2A52B" stopOpacity={0.4} />
					</linearGradient>
				</defs>
				<XAxis axisAt="bottom" orient="bottom" ticks={5} stroke="#aaa" tickStroke="#fff" />
				<YAxis stroke="#aaa" tickStroke="#fff" axisAt="left" orient="left" />
				<AreaSeries
					yAccessor={(d: any) => d.close}
					fill="url(#value-gradient)"
					strokeWidth={2}
					stroke="#F2A52B"
					interpolation={curveLinear}
					canvasGradient={canvasGradient}
				/>
			</Chart>
		</ChartCanvas>
	);
};

export const ValueChart = fitWidth(RawChart);
