import React from 'react';
import { Chart, ChartCanvas } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { AreaSeries } from 'react-stockcharts/lib/series';
import { createVerticalLinearGradient, hexToRGBA } from 'react-stockcharts/lib/utils';
import { scaleTime } from 'd3-scale';
import { curveLinear } from 'd3-shape';
import { fitDimensions } from 'react-stockcharts/lib/helper';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { CurrentCoordinate } from 'react-stockcharts/lib/coordinates';
import { ChartMode } from './ChartsCard';
import { SettChartData } from '../../../mobx/model/setts/sett-charts';

const canvasGradient = createVerticalLinearGradient([{ stop: 0, color: hexToRGBA('#F2A52B', 0.0) }]);

const useYAxisAccessor = (mode: ChartMode) => {
	return (data: SettChartData) => (mode === 'value' ? data.value : data.ratio);
};

interface Props {
	mode: ChartMode;
	data: SettChartData[];
	width: number;
	height: number;
}

const RawChart = ({ height, width, data, mode }: Props): JSX.Element => {
	const yAxisAccessor = useYAxisAccessor(mode);
	const yScaleFormatter = mode === 'value' ? format('.5s') : format('.5f');

	return (
		<ChartCanvas
			ratio={5 / 4}
			width={width}
			height={height}
			seriesName={'value-gradient'}
			margin={{ left: 60, right: 0, top: 8, bottom: 30 }}
			type="svg"
			data={data}
			xAccessor={(d: any) => d.timestamp}
			xScale={scaleTime()}
		>
			<Chart id={0} yExtents={yAxisAccessor}>
				<defs>
					<linearGradient id="value-gradient" x1="0" y1="100%" x2="0" y2="0%">
						<stop offset="0%" stopColor="#F2A52B" stopOpacity={0} />
						<stop offset="100%" stopColor="#F2A52B" stopOpacity={0.4} />
					</linearGradient>
				</defs>
				<CurrentCoordinate yAccessor={yAxisAccessor} displayFormat={timeFormat('%Y-%m-%d')} r={4} />
				<XAxis axisAt="bottom" orient="bottom" ticks={5} stroke="#aaa" tickStroke="#fff" />
				<YAxis stroke="#aaa" tickStroke="#fff" axisAt="left" orient="left" tickFormat={yScaleFormatter} />
				<AreaSeries
					yAccessor={yAxisAccessor}
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

export const SettChart = fitDimensions(RawChart);
