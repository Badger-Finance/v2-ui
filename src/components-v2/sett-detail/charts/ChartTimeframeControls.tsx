import React from 'react';
import { Button, ButtonGroup } from '@material-ui/core';
import { SettChartTimeframe } from './utils';

interface Props {
	value: SettChartTimeframe;
	onChange: (timeframe: SettChartTimeframe) => void;
}

export const ChartTimeframeControls = ({ value, onChange }: Props): JSX.Element => (
	<ButtonGroup variant="outlined" size="small" aria-label="chart timeframe controls">
		<Button
			disableElevation
			variant={value === SettChartTimeframe.day ? 'contained' : 'outlined'}
			onClick={() => onChange(SettChartTimeframe.day)}
		>
			1 day
		</Button>
		<Button
			disableElevation
			variant={value === SettChartTimeframe.week ? 'contained' : 'outlined'}
			onClick={() => onChange(SettChartTimeframe.week)}
		>
			1 week
		</Button>
		<Button
			disableElevation
			variant={value === SettChartTimeframe.month ? 'contained' : 'outlined'}
			onClick={() => onChange(SettChartTimeframe.month)}
		>
			1 Month
		</Button>
	</ButtonGroup>
);
