import React from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	icon: {
		width: 24,
		height: 24,
	},
	delegationAmount: {
		marginLeft: theme.spacing(1),
	},
	buttonContainer: {
		textAlign: 'end',
	},
	section: {
		textAlign: 'center',
	},
}));

const Delegation = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container alignItems="center">
			<Grid item xs className={classes.section}>
				<Typography>Convex Delegation</Typography>
				<Grid container>
					<img className={classes.icon} src="assets/icons/bvecvx.png" />
					<Typography className={classes.delegationAmount}>431.238976</Typography>
				</Grid>
			</Grid>
			<Grid item xs className={classes.section}>
				<Button color="primary" variant="contained">
					Delegate More CVX
				</Button>
			</Grid>
		</Grid>
	);
};

export default Delegation;
