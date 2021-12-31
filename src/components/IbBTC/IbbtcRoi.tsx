import React from 'react';
import { Divider, Grid, makeStyles, Paper, Typography, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Theme } from '@material-ui/core/styles';
import { StoreContext } from '../../mobx/store-context';
import { observer } from 'mobx-react-lite';

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

export const IbbtcRoi = observer((): JSX.Element => {
	const { ibBTCStore, onboard } = React.useContext(StoreContext);
	const { ibBTC, apyUsingLastDay, apyUsingLastWeek } = ibBTCStore;
	const classes = useStyles();
	const isDisplayXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
	const loadingApy = onboard.isActive() && (apyUsingLastDay === undefined || apyUsingLastWeek === undefined);

	return (
		<Grid container component={Paper} className={classes.container}>
			<Grid item container alignItems="center" xs={12} sm className={classes.token}>
				<img src={`/assets/icons/${ibBTC.token.symbol}.png`} alt="ROI Token Logo" className={classes.logo} />
				<Typography variant="h6">{`${ibBTC.token.symbol} ROI`}</Typography>
			</Grid>

			{!isDisplayXs && <Divider orientation="vertical" flexItem />}

			<Grid item container xs className={classes.apyInfoContainer}>
				<Grid item xs={12}>
					<Typography variant="h6">
						{loadingApy ? <Skeleton role="loader" className={classes.loader} /> : apyUsingLastDay || 'N/A'}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="caption">Sampled from last 24 hrs</Typography>
				</Grid>
			</Grid>

			<Divider orientation="vertical" flexItem />

			<Grid item container xs className={classes.apyInfoContainer}>
				<Grid item xs={12}>
					<Typography variant="h6">
						{loadingApy ? <Skeleton role="loader" className={classes.loader} /> : apyUsingLastWeek || 'N/A'}
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="caption">Sampled from last week</Typography>
				</Grid>
			</Grid>
		</Grid>
	);
});
