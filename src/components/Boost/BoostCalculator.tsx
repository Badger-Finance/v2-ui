import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostSlider } from './BoostSlider';
import { BoostBadge } from './BoostBadge';

const useStyles = makeStyles((theme) => ({
	container: {
		padding: theme.spacing(3),
		maxWidth: 650,
	},
}));

export const BoostCalculator = observer(() => {
	const classes = useStyles();

	return (
		<Grid container component={Paper} className={classes.container}>
			<Grid container spacing={3} justify="center">
				<Grid item>
					<BoostSlider />
				</Grid>
				<Grid item>
					<BoostBadge />
				</Grid>
				<Grid item>
					<BoostSlider />
				</Grid>
			</Grid>
		</Grid>
	);
});
