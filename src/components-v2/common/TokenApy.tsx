import React from 'react';
import { Divider, Grid, makeStyles, Paper, Typography, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Theme } from '@material-ui/core/styles';

interface Props {
	logo: string;
	apyFromLastDay?: string;
	apyFromLastWeek?: string;
}

const useStyles = makeStyles((theme) => ({
	container: {
		padding: '40px 24px 32px 24px',
	},
	logo: {
		height: theme.spacing(5),
		width: theme.spacing(5),
		marginRight: theme.spacing(1),
	},
	apyInfoContainer: {
		padding: theme.spacing(1),
		textAlign: 'center',
	},
	loader: {
		width: '50%',
		margin: 'auto',
	},
	token: {
		padding: theme.spacing(1),
		[theme.breakpoints.only('xs')]: {
			justifyContent: 'center',
			textAlign: 'center',
			marginBottom: theme.spacing(1),
		},
	},
}));

export const TokenApy = ({ logo, apyFromLastDay, apyFromLastWeek }: Props): JSX.Element => {
	const isDisplayXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
	const classes = useStyles();

	return (
		<Grid container component={Paper} className={classes.container}>
			<Grid item container alignItems="center" xs={12} sm className={classes.token}>
				<img src={logo} alt="APY Token Logo" className={classes.logo} />
				<Typography variant="h5">APY</Typography>
			</Grid>

			{!isDisplayXs && <Divider orientation="vertical" flexItem />}

			<Grid item container xs className={classes.apyInfoContainer}>
				<Grid item xs={12}>
					<Typography variant="h5">
						{apyFromLastDay ? apyFromLastDay : <Skeleton role="loader" className={classes.loader} />}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="caption">Sampled from last 24 hrs</Typography>
				</Grid>
			</Grid>

			<Divider orientation="vertical" flexItem />

			<Grid item container xs className={classes.apyInfoContainer}>
				<Grid item xs={12}>
					<Typography variant="h5">
						{apyFromLastWeek ? apyFromLastWeek : <Skeleton role="loader" className={classes.loader} />}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="caption">Sampled from last week</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
};
