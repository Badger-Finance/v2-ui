import React from 'react';
import { Card, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Delegation from './Delegation';
import Earnings from './Earnings';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(4),
		backgroundColor: '#3A3A3A',
	},
	delegationSection: {
		marginTop: theme.spacing(2),
		padding: theme.spacing(3),
	},
	title: {
		fontSize: 32,
		fontWeight: 'bolder',
	},
	infoSection: {
		marginTop: 50,
	},
}));

const Banner = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Card classes={{ root: classes.root }}>
			<Grid container spacing={3}>
				<Grid container item xs={12} sm direction="column" justify="space-between">
					<Typography className={classes.title}>Badger Bribe Season is Here</Typography>
					<div>
						<Typography variant="body2">
							After a set of locks have opened, and additional information goes here, the badger locking
							bonus event will occur on
						</Typography>
						<Typography variant="body1">December 29th, 2021</Typography>
					</div>
					<Grid container component={Card} className={classes.delegationSection}>
						<Delegation />
					</Grid>
				</Grid>
				<Grid item xs={12} sm>
					<Earnings />
				</Grid>
			</Grid>
		</Card>
	);
};

export default Banner;
