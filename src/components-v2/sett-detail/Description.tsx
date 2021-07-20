import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
	},
	namesContainer: {
		marginLeft: theme.spacing(1),
	},
	settName: {
		display: 'inline',
		fontSize: 20,
	},
	vaultName: {
		fontSize: 14,
	},
	settLogo: {
		margin: 'auto',
	},
	logoContainer: {
		display: 'flex',
		width: 50,
		height: 50,
	},
	apyBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		maxHeight: 24,
		fontSize: 12,
		borderRadius: 4,
		padding: 4,
		color: theme.palette.common.black,
		marginLeft: theme.spacing(1),
		backgroundColor: '#74D189',
	},
	apyText: {
		marginLeft: 4,
	},
}));

export const Description = (): JSX.Element => {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<Grid item className={classes.logoContainer}>
				<img className={classes.settLogo} src="/assets/icons/slp-digg-wbtc.png" />
			</Grid>
			<Grid item className={classes.namesContainer}>
				<Box display="flex" alignItems="center">
					<Typography className={classes.settName}>Wrapped BTC/DIGG</Typography>
					<Typography className={classes.apyBadge}>
						<TrendingUpIcon />
						<span className={classes.apyText}>139.34%</span>
					</Typography>
				</Box>
				<Typography className={classes.vaultName} color="textSecondary">
					SLP-DIGG-WBTC
				</Typography>
			</Grid>
		</div>
	);
};
