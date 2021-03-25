import React from 'react';
import { Button, Grid, makeStyles, Paper, Typography, Fade } from '@material-ui/core';
import { diggToCurrency } from 'mobx/utils/helpers';
import { StoreContext } from 'mobx/store-context';
import { useBdiggToDigg, useConnectWallet } from 'mobx/utils/hooks';
import { Skeleton } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	center: {
		margin: 'auto',
	},
	centerText: {
		textAlign: 'center',
	},
	mainPapers: {
		padding: theme.spacing(2),
	},
	redeemButton: {
		marginTop: theme.spacing(2),
		color: theme.palette.common.black,
	},
}));

const Container: React.FC = ({ children }) => {
	const classes = useStyles();
	return (
		<Fade in>
			<Grid item container justify="center" xs={12} className={classes.centerText}>
				<Grid item xs={12} sm={8} md={7}>
					<Paper elevation={0} className={classes.mainPapers}>
						<Grid container spacing={1}>
							<Grid item xs={12}>
								<Typography>Redemption Pool Remaining</Typography>
							</Grid>
							{children}
						</Grid>
					</Paper>
				</Grid>
			</Grid>
		</Fade>
	);
};

export const PoolBalance: React.FC = observer(() => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const bdiggToDigg = useBdiggToDigg();
	const connectWallet = useConnectWallet();

	const { connectedAddress } = store.wallet;
	const { poolBalance, loadingPoolBalance } = store.honeyPot;
	const poolBalanceDiggs = poolBalance && bdiggToDigg(poolBalance);

	if (!connectedAddress) {
		return (
			<Container>
				<Grid item xs={12}>
					<Button
						className={classes.redeemButton}
						onClick={connectWallet}
						variant="contained"
						color="primary"
					>
						Check Rewards
					</Button>
				</Grid>
			</Container>
		);
	}

	if (loadingPoolBalance || !poolBalance || !poolBalanceDiggs || poolBalanceDiggs?.isNaN()) {
		return (
			<Container>
				<Grid item xs={12}>
					<Typography variant="h5">
						<Skeleton className={classes.center} width="30%" />
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="subtitle1">
						<Skeleton className={classes.center} width="30%" />
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="subtitle1">
						<Skeleton className={classes.center} width="30%" />
					</Typography>
				</Grid>
			</Container>
		);
	}

	return (
		<Container>
			<Grid item xs={12}>
				<Typography variant="h5" color="textPrimary">
					{`${poolBalance.dividedBy(1e18).toFixed(5)} bDIGG`}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1" color="textSecondary">
					{`${poolBalanceDiggs.dividedBy(1e18).toFixed(5)} DIGG / ${diggToCurrency({
						amount: poolBalanceDiggs,
						currency: 'btc',
					})}`}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1" color="textSecondary">
					{diggToCurrency({
						amount: poolBalanceDiggs,
						currency: 'usd',
					})}
				</Typography>
			</Grid>
		</Container>
	);
});
