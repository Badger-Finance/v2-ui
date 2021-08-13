import React from 'react';
import { Box, Grid, Typography } from '@material-ui/core';
import { StyledDivider } from '../styled';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		marginBottom: 20,
	},
	specName: {
		fontSize: 12,
		lineHeight: '1.66',
	},
	tokenSpec: {
		marginBottom: theme.spacing(1),
	},
	tokenName: {
		marginLeft: theme.spacing(1),
	},
	tokenImageContainer: {
		width: 16,
		height: 16,
		display: 'inline',
		alignItems: 'center',
	},
	tokenImage: {
		width: '100%',
	},
}));

export const Tokens = (): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container className={classes.root}>
			<Typography>Tokens</Typography>
			<StyledDivider />
			<Grid container>
				<Grid className={classes.tokenSpec} container justify="space-between">
					<Box display="flex" alignItems="center">
						<div className={classes.tokenImageContainer}>
							<img className={classes.tokenImage} src="/assets/icons/wbtc.svg" alt="wbtc-icon" />
						</div>
						<Typography
							display="inline"
							color="textSecondary"
							className={clsx(classes.specName, classes.tokenName)}
						>
							WBTC
						</Typography>
					</Box>
					<Typography display="inline" variant="subtitle2">
						114
					</Typography>
				</Grid>
				<Grid className={classes.tokenSpec} container justify="space-between">
					<Box display="flex" alignItems="center">
						<div className={classes.tokenImageContainer}>
							<img className={classes.tokenImage} src="/assets/icons/digg.png" alt="digg-icon" />
						</div>
						<Typography
							className={clsx(classes.specName, classes.tokenName)}
							display="inline"
							color="textSecondary"
						>
							DIGG
						</Typography>
					</Box>
					<Typography display="inline" variant="subtitle2">
						123
					</Typography>
				</Grid>
				<Grid container justify="space-between">
					<Typography className={classes.specName} display="inline" color="textSecondary">
						Token Ratio
					</Typography>
					<Typography display="inline" variant="subtitle2">
						1.0789
					</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};
