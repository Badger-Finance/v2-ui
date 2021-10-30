/* eslint-disable react/prop-types */
import React from 'react';
import { Button, Grid, makeStyles, Paper, Typography, Fade } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';
import { useConnectWallet } from 'mobx/utils/hooks';
import { Skeleton } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import { sett_system } from 'config/deployments/mainnet.json';

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
	learnMore: {
		marginTop: theme.spacing(1),
		padding: theme.spacing(1),
	},
}));

const Container = ({ children }: { children: React.ReactNode }) => {
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
					<Button
						className={classes.learnMore}
						fullWidth
						aria-label="Learn More"
						variant="text"
						size="small"
						color="primary"
						href="https://badgerdao.medium.com/badger-x-meme-nft-honeypot-part-ii-diamond-hands-7111d38b5df4"
						target="_"
					>
						Learn More
					</Button>
				</Grid>
			</Grid>
		</Fade>
	);
};

export const PoolBalance = observer(() => {
	const store = React.useContext(StoreContext);
	const classes = useStyles();
	const connectWallet = useConnectWallet();

	// Disabling reason: importing this prop from the UI store
	// triggers the reduceStats method that's needed for the
	// bDIGG <> DIGG exchange
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { setts } = store;
	const { poolBalance, loadingPoolBalance } = store.honeyPot;
	const { connectedAddress } = store.wallet;

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

	if (loadingPoolBalance || !poolBalance || !setts.settMap) {
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

	const diggMultiplier = setts.settMap[sett_system.vaults['native.digg']].pricePerFullShare;
	const poolBalanceDiggs = poolBalance.mul(diggMultiplier);
	return (
		<Container>
			<Grid item xs={12}>
				<Typography variant="h5" color="textPrimary">
					{poolBalance && `${poolBalance.div(1e18).toString()} bDIGG`}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1" color="textSecondary">
					{poolBalanceDiggs &&
						poolBalance &&
						`${poolBalanceDiggs.div(1e18).toString()} DIGG / ${poolBalance}`}
				</Typography>
			</Grid>
			<Grid item xs={12}>
				<Typography variant="subtitle1" color="textSecondary">
					{poolBalance && poolBalance}
				</Typography>
			</Grid>
		</Container>
	);
});
