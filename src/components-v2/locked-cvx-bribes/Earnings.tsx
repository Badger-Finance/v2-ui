import React from 'react';
import { Button, Card, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%',
		padding: theme.spacing(3),
	},
	statRow: {
		marginTop: theme.spacing(2),
	},
	stat: {
		marginLeft: theme.spacing(1),
	},
	badgerImage: {
		width: 24,
		height: 24,
	},
	claimButton: {
		marginLeft: theme.spacing(2),
	},
}));

const Earnings = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Card className={classes.root}>
			<Grid container>
				<Typography variant="h5">Earnings from CVX Bribes</Typography>
				<Grid container className={classes.statRow}>
					<Typography variant="subtitle1">Total</Typography>
					<Grid container alignItems="center">
						<img src="assets/icons/badger.png" className={classes.badgerImage} />
						<Typography variant="h4" display="inline" className={classes.stat}>
							398.31342342
						</Typography>
					</Grid>
				</Grid>
				<Grid container className={classes.statRow}>
					<Typography variant="subtitle1">Unclaimed</Typography>
					<Grid container alignItems="center">
						<img src="assets/icons/badger.png" className={classes.badgerImage} />
						<Typography variant="h4" color="primary" display="inline" className={classes.stat}>
							33.89
						</Typography>
						<Button className={classes.claimButton} color="primary" variant="contained">
							Claim Bonus
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Card>
	);
};

export default Earnings;
