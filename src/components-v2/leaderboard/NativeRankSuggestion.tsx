import { makeStyles, Typography } from '@material-ui/core';
import { LEADERBOARD_RANKS } from 'config/constants';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { numberWithCommas, formatWithoutExtraZeros } from 'mobx/utils/helpers';
import React, { useContext } from 'react';
import { getRankNumberFromBoost } from 'utils/componentHelpers';

const useStyles = makeStyles(() => ({
	suggestionContainer: {
		marginLeft: 'auto',
	},
	amountToNextRank: {
		fontSize: 12,
	},
}));

const NativeRankSuggestion = observer((): JSX.Element | null => {
	const { boostOptimizer, user } = useContext(StoreContext);
	const { accountDetails: account } = user;
	const classes = useStyles();

	if (!account || !account.boost || !account.nativeBalance || !account.nonNativeBalance) {
		return null;
	}

	const { boost, nativeBalance, nonNativeBalance } = account;
	const currentLevel = getRankNumberFromBoost(boost);
	const nextLevel = LEADERBOARD_RANKS[currentLevel - 1];

	// if user has already reached max level there's no need for suggestion
	if (!nextLevel) {
		return null;
	}

	const amountToReachNextRank = boostOptimizer.calculateNativeToMatchBoost(
		nativeBalance,
		nonNativeBalance,
		nextLevel.boostRangeStart,
	);

	if (!amountToReachNextRank || amountToReachNextRank.lte(0)) {
		return null;
	}

	return (
		<div className={classes.suggestionContainer}>
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
		</div>
	);
});

export default NativeRankSuggestion;
