import React, { useContext } from 'react';
import { Button, Card, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { StoreContext } from '../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';
import { observer } from 'mobx-react-lite';
import { formatBalance } from './utils';
import { SAFE_BOX_ILLUSTRATION_BREAKPOINT } from './Banner';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100%',
		padding: theme.spacing(3),
	},
	container: {
		height: '100%',
		[theme.breakpoints.up(SAFE_BOX_ILLUSTRATION_BREAKPOINT)]: {
			maxWidth: '60%',
		},
	},
	statRow: {
		marginTop: theme.spacing(2),
	},
	statName: {
		fontWeight: 500,
	},
	stat: {
		marginLeft: theme.spacing(1),
		fontWeight: 500,
	},
	unclaimedAmount: {
		marginRight: theme.spacing(2),
	},
	badgerImage: {
		width: 24,
		height: 24,
	},
	earningsTitle: {
		fontSize: 20,
		fontWeight: 500,
	},
}));

const Earnings = (): JSX.Element => {
	const { lockedCvxDelegation } = useContext(StoreContext);
	const classes = useStyles();

	const { totalEarned, unclaimedBalance } = lockedCvxDelegation;
	const totalEarningsFallback = totalEarned === null ? 'N/A' : <Skeleton width={30} />;
	const unclaimedFallback = unclaimedBalance === null ? 'N/A' : <Skeleton width={30} />;
	const areClaimsAvailable = unclaimedBalance?.gt(0);

	return (
		<Card className={classes.root}>
			<Grid container className={classes.container}>
				<Typography className={classes.earningsTitle}>Earned Incentives</Typography>
				<Grid container className={classes.statRow}>
					<Typography variant="subtitle1" className={classes.statName}>
						Total Claimed
					</Typography>
					<Grid container alignItems="center">
						<img src="assets/icons/badger.png" className={classes.badgerImage} alt="badger coin image" />
						<Typography variant="h5" display="inline" className={classes.stat}>
							{totalEarned ? formatBalance(totalEarned) : totalEarningsFallback}
						</Typography>
					</Grid>
				</Grid>
				<Grid container className={classes.statRow}>
					<Typography variant="subtitle1" className={classes.statName}>
						Unclaimed
					</Typography>
					<Grid container alignItems="center">
						<img src="assets/icons/badger.png" className={classes.badgerImage} alt="badger coin image" />
						<Typography
							variant="h5"
							color="primary"
							display="inline"
							className={clsx(classes.stat, classes.unclaimedAmount)}
						>
							{unclaimedBalance ? formatBalance(unclaimedBalance) : unclaimedFallback}
						</Typography>
						<Button
							color="primary"
							variant="contained"
							disabled={!areClaimsAvailable}
							onClick={() => lockedCvxDelegation.claimVotiumRewards()}
						>
							Claim Bonus
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Card>
	);
};

export default observer(Earnings);
