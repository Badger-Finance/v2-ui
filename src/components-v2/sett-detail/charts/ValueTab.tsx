import React, { useState } from 'react';
import { ValueChart } from './ValueChart';
import { Button, ButtonGroup, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	header: {
		marginBottom: theme.spacing(2),
	},
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

export const ValueTab = (): JSX.Element => {
	const classes = useStyles();
	const [range, setRange] = useState(7);

	return (
		<Grid container>
			<Grid item container alignItems="center" justify="space-between" className={classes.header}>
				<Grid container item xs={12} sm={6} direction="column" className={classes.titleText}>
					<Typography variant="h6">Value</Typography>
					<Typography variant="body2" color="textSecondary">
						Drag the chart and pan the axes to explore
					</Typography>
				</Grid>
				<Grid item xs={12} sm={6} className={classes.buttonGroupContainer}>
					<ButtonGroup variant="outlined" size="small" aria-label="outlined button group">
						<Button
							aria-label="1 day"
							disableElevation
							variant={range === 1 ? 'contained' : 'outlined'}
							onClick={() => setRange(1)}
						>
							1 day
						</Button>
						<Button
							aria-label="1 week"
							disableElevation
							variant={range === 7 ? 'contained' : 'outlined'}
							onClick={() => setRange(7)}
						>
							1 week
						</Button>
						<Button
							aria-label="1 Month"
							disableElevation
							variant={range === 30 ? 'contained' : 'outlined'}
							onClick={() => setRange(30)}
						>
							1 Month
						</Button>
					</ButtonGroup>
				</Grid>
			</Grid>
			<ValueChart />
		</Grid>
	);
};
