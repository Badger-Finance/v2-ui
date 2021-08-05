import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Grid, Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
	holdingsName: {
		fontSize: 16,
	},
	cardContainer: {
		padding: theme.spacing(2),
	},
	logoContainer: {
		display: 'inline-flex',
		width: 32,
		height: 32,
		marginRight: theme.spacing(1),
	},
	logo: {
		width: '100%',
		margin: 'auto',
	},
	amountsContainer: {
		marginTop: theme.spacing(-1),
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	amountText: {
		marginTop: theme.spacing(1),
	},
}));

interface Props {
	name: string;
	logo: string;
	amount: string;
	dollarAmount: string | React.ReactNode;
}

export const HoldingItem = ({ name, logo, amount, dollarAmount }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Paper className={classes.cardContainer}>
			<Typography className={classes.holdingsName}>{name}</Typography>
			<Grid container className={classes.amountsContainer}>
				<Box display="inline-flex" className={classes.amountText}>
					<div className={classes.logoContainer}>
						<img className={classes.logo} src={logo} alt={`${name} holdings`} />
					</div>
					<Typography variant="h5" display="inline">
						{amount}
					</Typography>
				</Box>
				<Typography variant="body2" color="textSecondary" className={classes.amountText}>
					{dollarAmount}
				</Typography>
			</Grid>
		</Paper>
	);
};
