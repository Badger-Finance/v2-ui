import React from 'react';
import { Chart, ChartCanvas } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { CurrentCoordinate, MouseCoordinateX, MouseCoordinateY } from 'react-stockcharts/lib/coordinates';
import { AreaSeries } from 'react-stockcharts/lib/series';
import { createVerticalLinearGradient, hexToRGBA } from 'react-stockcharts/lib/utils';
import { scaleTime } from 'd3-scale';
import { curveLinear } from 'd3-shape';
import { fitWidth } from 'react-stockcharts/lib/helper';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { ChartMode, SettChartData } from '../../../mobx/model/setts/sett-charts';

const canvasGradient = createVerticalLinearGradient([{ stop: 0, color: hexToRGBA('#F2A52B', 0.0) }]);

const getYAxisAccessor = (mode: ChartMode) => {
	return (data: SettChartData) => {
		const optionsFromMode = {
			[ChartMode.value]: data.value,
			[ChartMode.ratio]: data.ratio,
			[ChartMode.accountBalance]: data.value,
		};

		return optionsFromMode[mode];
	};
};

interface Props {
	mode: ChartMode;
	data: SettChartData[];
	width: number;
}

// the packages core fitWidth HOC does not support function components
// see: https://github.com/rrag/react-stockcharts/issues/370#issuecomment-336439030
class RawChartClass extends React.Component<Props> {
	render() {
		const { width, data, mode } = this.props;

		const yScaleFormatterByMode = {
			[ChartMode.value]: format('^$.3s'),
			[ChartMode.ratio]: format('^.3f'),
			[ChartMode.accountBalance]: format('^$.3s'),
		};

		const yScaleFormatter = yScaleFormatterByMode[mode];
		const yAxisAccessor = getYAxisAccessor(mode);

		return (
			<ChartCanvas
				ratio={5 / 4}
				width={width}
				height={350}
				seriesName={'value-gradient'}
				margin={{ left: 50, right: 0, top: 8, bottom: 30 }}
				type="svg"
				data={data}
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
	}
}

export const SettChart = fitWidth(RawChartClass);
