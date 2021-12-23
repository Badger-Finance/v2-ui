import React from 'react';
import { Divider, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(3),
	},
	title: {
		fontSize: 18,
	},
	content: {
		marginTop: theme.spacing(2),
	},
	divider: {
		width: '100%',
		margin: theme.spacing(2, 0),
	},
}));

interface Props {
	closeIcon?: React.ReactNode;
}

export const DepositFeesInformation = ({ closeIcon }: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Grid container justifyContent="space-between" alignItems="center">
				<Typography variant="body1" display="inline" className={classes.title}>
					Fee Information
				</Typography>
				{closeIcon}
			</Grid>
			<div className={classes.content}>
				<Typography variant="body1" color="textSecondary">
					Fees are charged on certain Vault Vaults, and are sent to the BadgerDAO treasury, or shared with the
					strategist who wrote the vault strategy.
				</Typography>
				<Divider className={classes.divider} />
				<div>
					<Typography variant="body2" color="textSecondary">
						- Performance Fees are assessed on the profit that the strategy creates
					</Typography>
					<Typography variant="body2" color="textSecondary">
						- Management Fees are charged on the entire principal over the course of a year
					</Typography>
					<Typography variant="body2" color="textSecondary">
						- Both Performance and Management Fees are factored into all ROI calculations
					</Typography>
				</div>
			</div>
		</Grid>
	);
};
