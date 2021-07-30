import { makeStyles, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import { numberWithCommas, formatWithoutExtraZeros } from 'mobx/utils/helpers';
import React, { useContext } from 'react';
import { calculateNativeToMatchMultiplier, rankAndLevelNumbersFromSpec } from '../../utils/boost-ranks';
import { BOOST_RANKS } from '../../config/system/boost-ranks';

const useStyles = makeStyles(() => ({
	suggestionContainer: {
		marginLeft: 'auto',
	},
	amountToNextRank: {
		fontSize: 12,
	},
}));

const NativeRankSuggestion = observer((): JSX.Element | null => {
	const { user } = useContext(StoreContext);
	const { accountDetails: account } = user;
	const classes = useStyles();

	if (!account) {
		return null;
	}

	const { nativeBalance, nonNativeBalance, stakeRatio } = account;
	const [currentRank] = rankAndLevelNumbersFromSpec(stakeRatio * 100, 'stake');
	const nextRank = BOOST_RANKS[currentRank + 1];

	// if user has already reached max level there's no need for suggestion
	if (!nextRank) {
		return null;
	}

	const amountToReachNextRank = calculateNativeToMatchMultiplier(
		nativeBalance,
		nonNativeBalance,
		nextRank.levels[0].multiplier,
	);

	if (!amountToReachNextRank || amountToReachNextRank <= 0) {
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
