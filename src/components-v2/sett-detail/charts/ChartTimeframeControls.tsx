import React from 'react';
import { Button, ButtonGroup } from '@material-ui/core';
import { ChartMode, SettChartTimeframe } from '../../../mobx/model/setts/sett-charts';

interface Props {
	mode: ChartMode;
	value: SettChartTimeframe;
	onChange: (timeframe: SettChartTimeframe) => void;
}

export const ChartTimeframeControls = ({ mode, value, onChange }: Props): JSX.Element => (
	<ButtonGroup variant="outlined" size="small" aria-label="chart timeframe controls">
		{mode !== ChartMode.Ratio && (
			<Button
				disableElevation
				variant={value === SettChartTimeframe.Day ? 'contained' : 'outlined'}
				onClick={() => onChange(SettChartTimeframe.Day)}
			>
				1 day
			</Button>
		)}
		<Button
			disableElevation
			variant={value === SettChartTimeframe.Week ? 'contained' : 'outlined'}
			onClick={() => onChange(SettChartTimeframe.Week)}
		>
			1 week
		</Button>
		<Button
			disableElevation
			variant={value === SettChartTimeframe.Month ? 'contained' : 'outlined'}
			onClick={() => onChange(SettChartTimeframe.Month)}
		>
			1 Month
		</Button>
	</ButtonGroup>
);
