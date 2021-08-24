import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { ChartTimeframeControls } from './ChartTimeframeControls';
import { makeStyles } from '@material-ui/core/styles';
import { ChartModeTitles } from '../utils';
import { ChartMode, SettChartTimeframe } from '../../../mobx/model/setts/sett-charts';

const useStyles = makeStyles((theme) => ({
	titleText: {
		[theme.breakpoints.down('xs')]: {
			textAlign: 'center',
		},
	},
	buttonGroupContainer: {
		textAlign: 'end',
		[theme.breakpoints.down('xs')]: {
			marginTop: theme.spacing(1),
			textAlign: 'center',
		},
	},
}));

interface Props {
	mode: ChartMode;
	timeframe: SettChartTimeframe;
	onTimeframeChange: (timeframe: SettChartTimeframe) => void;
}

export const ChartsHeader = ({ mode, timeframe, onTimeframeChange }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container alignItems="center" justify="space-between">
			<Grid container item xs={12} sm={6} direction="column" className={classes.titleText}>
				<Typography variant="h6">{ChartModeTitles[mode]}</Typography>
				<Typography variant="body2" color="textSecondary">
					Drag the chart and pan the axes to explore
				</Typography>
			</Grid>
			<Grid item xs={12} sm={6} className={classes.buttonGroupContainer}>
				<ChartTimeframeControls mode={mode} value={timeframe} onChange={onTimeframeChange} />
			</Grid>
		</Grid>
	);
};
