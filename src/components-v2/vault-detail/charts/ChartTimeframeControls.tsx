import React from 'react';
import { Button, ButtonGroup } from '@material-ui/core';
import { ChartMode, VaultChartTimeframe } from '../../../mobx/model/vaults/vault-charts';

interface Props {
	mode: ChartMode;
	value: VaultChartTimeframe;
	onChange: (timeframe: VaultChartTimeframe) => void;
}

export const ChartTimeframeControls = ({ mode, value, onChange }: Props): JSX.Element => (
	<ButtonGroup variant="outlined" size="small" aria-label="chart timeframe controls">
		{mode !== ChartMode.Ratio && (
			<Button
				disableElevation
				variant={value === VaultChartTimeframe.Day ? 'contained' : 'outlined'}
				onClick={() => onChange(VaultChartTimeframe.Day)}
			>
				1 day
			</Button>
		)}
		<Button
			disableElevation
			variant={value === VaultChartTimeframe.Week ? 'contained' : 'outlined'}
			onClick={() => onChange(VaultChartTimeframe.Week)}
		>
			1 week
		</Button>
		<Button
			disableElevation
			variant={value === VaultChartTimeframe.Month ? 'contained' : 'outlined'}
			onClick={() => onChange(VaultChartTimeframe.Month)}
		>
			1 Month
		</Button>
	</ButtonGroup>
);
