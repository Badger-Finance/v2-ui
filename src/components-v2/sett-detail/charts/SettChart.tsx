import React from 'react';
import { Chart, ChartCanvas } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { MouseCoordinateX, MouseCoordinateY } from 'react-stockcharts/lib/coordinates';
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

const getYAxisAccessor = (mode: ChartMode) => {
	return (data: SettChartData) => {
		const optionsFromMode = {
			[ChartMode.value]: data.value,
			[ChartMode.ratio]: data.ratio,
			[ChartMode.accountBalance]: data.balance,
		};

		return optionsFromMode[mode];
	};
};

const accountScaleData = (data: SettChartData[], scalar: number) => {
	return data.map((point) => ({ ...point, balance: point.balance * scalar }));
};

interface Props {
	mode: ChartMode;
	data: SettChartData[];
	accountScalar?: number;
	width: number;
	height: number;
}

const RawChart = ({ height, width, data, mode, accountScalar }: Props): JSX.Element => {
	const yScaleFormatterByMode = {
		[ChartMode.value]: format('^$.3s'),
		[ChartMode.ratio]: format('^.3f'),
		[ChartMode.accountBalance]: format('^.3r'),
	};

	console.log(
		'points =>',
		data.map((p) => p.balance),
	);
	console.log({ accountScalar });

	const yAxisAccessor = getYAxisAccessor(mode);
	const yScaleFormatter = yScaleFormatterByMode[mode];
	const chartData = accountScalar ? accountScaleData(data, accountScalar) : data;

	return (
		<ChartCanvas
			ratio={5 / 4}
			width={width}
			height={height}
			seriesName={'value-gradient'}
			margin={{ left: 50, right: 0, top: 8, bottom: 30 }}
			type="svg"
			data={chartData}
			xAccessor={(d: any) => d.timestamp}
			xScale={scaleTime()}
			mouseMoveEvent={true}
			panEvent={true}
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
				<MouseCoordinateX at="bottom" orient="bottom" displayFormat={timeFormat('%Y-%m-%d')} />
				<YAxis stroke="#aaa" tickStroke="#fff" axisAt="left" orient="left" tickFormat={yScaleFormatter} />
				<MouseCoordinateY at="left" orient="left" displayFormat={yScaleFormatter} />
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
