import React, { useContext } from 'react';
import { Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { formatWithoutExtraZeros, numberWithCommas } from '../../mobx/utils/helpers';
import { useConnectWallet } from '../../mobx/utils/hooks';
import routes from '../../config/routes';
import { Skeleton } from '@material-ui/lab';
import { getRankNumberFromBoost } from '../../utils/componentHelpers';
import { LEADERBOARD_RANKS } from '../../config/constants';

const useStyles = makeStyles((theme) => ({
	amountToNextRank: {
		fontSize: 12,
	},
	justifyCenterOnMobile: {
		[theme.breakpoints.down('xs')]: {
			justifyContent: 'center',
		},
	},
	boostContainer: {
		[theme.breakpoints.down('xs')]: {
			textAlign: 'center',
			marginBottom: 16,
		},
	},
	calculateBoostContainer: {
		[theme.breakpoints.down('xs')]: {
			marginBottom: 8,
		},
	},
	amountToNextRankContainer: {
		textAlign: 'end',
		[theme.breakpoints.down('xs')]: {
			textAlign: 'center',
		},
	},
	headerValueText: {
		marginLeft: theme.spacing(1),
	},
}));

export const LeaderboardAccountInformation = observer(
	(): JSX.Element => {
		const { boostOptimizer, user, router, wallet } = useContext(StoreContext);
		const connectWallet = useConnectWallet();
		const classes = useStyles();

		const nativeHoldings = boostOptimizer.nativeHoldings;
		const nonNativeHoldings = boostOptimizer.nonNativeHoldings;

		const boost = user.accountDetails?.boost;
		const rank = user.accountDetails?.boostRank;

		const currentBadgerLevel = boost ? getRankNumberFromBoost(boost) : undefined;
		const nextBadgerLevel =
			currentBadgerLevel !== undefined ? LEADERBOARD_RANKS[currentBadgerLevel - 1] : undefined;

		let amountToReachNextRank;

		if (nextBadgerLevel && nativeHoldings && nonNativeHoldings) {
			amountToReachNextRank = boostOptimizer.calculateNativeToMatchBoost(
				nativeHoldings.toString(),
				nonNativeHoldings.toString(),
				nextBadgerLevel.boostRangeStart,
			);
		}

		// Show N/A when wallet is not connected otherwise show loading skeleton
		const infoPlaceholder = !wallet.connectedAddress ? 'N/A' : <Skeleton width={30} />;

		return (
			<Grid container>
				<Grid item container alignItems="center" xs={12} sm className={classes.boostContainer}>
					<Grid container item xs={12} alignItems="center" className={classes.justifyCenterOnMobile}>
						<Typography variant="h2" display="inline">
							Boost:
						</Typography>
						<Typography variant="h2" display="inline" className={classes.headerValueText}>
							{boost !== undefined ? boost : infoPlaceholder}
						</Typography>
					</Grid>
					<Grid container item xs={12} alignItems="center" className={classes.justifyCenterOnMobile}>
						<Typography variant="h6" color="textSecondary" display="inline">
							Rank:
						</Typography>
						<Typography
							variant="h6"
							color="textSecondary"
							display="inline"
							className={classes.headerValueText}
						>
							{rank !== undefined ? rank : infoPlaceholder}
						</Typography>
					</Grid>
				</Grid>
				<Grid item container xs={12} sm className={classes.amountToNextRankContainer} alignItems="center">
					<Grid item xs={12} className={classes.calculateBoostContainer}>
						{wallet.connectedAddress ? (
							<Button
								color="primary"
								variant="contained"
								onClick={() => router.goTo(routes.boostOptimizer)}
							>
								Calculate Boost
							</Button>
						) : (
							<Button color="primary" variant="contained" onClick={connectWallet}>
								Connect Wallet
							</Button>
						)}
					</Grid>
					{nonNativeHoldings && nonNativeHoldings.eq(0) && (
						<Grid item xs={12}>
							<Typography className={classes.amountToNextRank} color="textSecondary">
								Add Non Native assets to be able to improve your boost
							</Typography>
						</Grid>
					)}
					{amountToReachNextRank && amountToReachNextRank.gt(0) && (
						<Grid item xs={12}>
							<Typography className={classes.amountToNextRank} color="textSecondary">
								<Typography className={classes.amountToNextRank} color="textPrimary" component="span">
									{`$${numberWithCommas(formatWithoutExtraZeros(amountToReachNextRank, 3))}`}
								</Typography>
								{` more `}
								<Typography className={classes.amountToNextRank} color="textPrimary" component="span">
									NATIVE
								</Typography>{' '}
								to next rank
							</Typography>
						</Grid>
					)}
				</Grid>
			</Grid>
		);
	},
);
