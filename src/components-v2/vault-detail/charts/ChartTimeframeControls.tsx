import { ChartTimeFrame } from '@badger-dao/sdk';
import { Button, ButtonGroup } from '@material-ui/core';
import React from 'react';

interface Props {
  value: ChartTimeFrame;
  onChange: (timeframe: ChartTimeFrame) => void;
}

export const ChartTimeframeControls = ({ value, onChange }: Props): JSX.Element => (
  <ButtonGroup variant="outlined" size="small" aria-label="chart timeframe controls">
    <Button
      disableElevation
      variant={value === ChartTimeFrame.Day ? 'contained' : 'outlined'}
      onClick={() => onChange(ChartTimeFrame.Day)}
    >
      1 day
    </Button>
    <Button
      disableElevation
      variant={value === ChartTimeFrame.Week ? 'contained' : 'outlined'}
      onClick={() => onChange(ChartTimeFrame.Week)}
    >
      1 week
    </Button>
    <Button
      disableElevation
      variant={value === ChartTimeFrame.Month ? 'contained' : 'outlined'}
      onClick={() => onChange(ChartTimeFrame.Month)}
    >
      1 Month
    </Button>
  </ButtonGroup>
);
