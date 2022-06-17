import { Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { MIN_BOOST, MIN_BOOST_RANK } from '../../config/system/boost-ranks';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import { calculateUserBoost, getHighestRankFromStakeRatio } from '../../utils/boost-ranks';
import { isValidCalculatedValue } from '../../utils/componentHelpers';
import { RankList } from './RankList';
import { StakeInformationHeader } from './StakeInformationHeader';

const useStyles = makeStyles((theme) => ({
	root: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		height: '100%',
	},
	rank: {
		marginRight: theme.spacing(1),
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			margin: theme.spacing(2, 0),
		},
		margin: theme.spacing(2, 0),
	},
	viewLeaderBoardContainer: {
		display: 'flex',
		justifyContent: 'flex-end',
		marginTop: theme.spacing(2),
	},
	placeholderProgressBar: {
		position: 'relative',
		alignSelf: 'stretch',
		width: 4,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	lockedRankItem: {
		opacity: 0.5,
	},
	unlockedRankItem: {
		opacity: 1,
	},
}));

interface Props {
	native?: string;
	nonNative?: string;
	onRankClick: (rank: BoostRank) => void;
}

export const StakeInformation = observer(({ native, nonNative, onRankClick }: Props): JSX.Element => {
	const {
		user: { accountDetails },
		wallet,
	} = React.useContext(StoreContext);

	const classes = useStyles();

	const isLoading = wallet.isConnected && accountDetails === undefined;
	const accountNative = accountDetails?.nativeBalance;
	const accountNonNative = accountDetails?.nonNativeBalance;

	const calculatedStakeRatio = Number(native) / Number(nonNative);
	const calculatedAccountRatio = Number(accountNative) / Number(accountNonNative);

	const isValidStakeRatio = isValidCalculatedValue(calculatedStakeRatio);
	const isValidAccountRatio = isValidCalculatedValue(calculatedAccountRatio);

	const stakeRatio = isValidStakeRatio ? calculatedStakeRatio : MIN_BOOST_RANK.stakeRatioBoundary;
	const accountStakeRatio = isValidAccountRatio ? calculatedAccountRatio : MIN_BOOST_RANK.stakeRatioBoundary;

	const currentRank = getHighestRankFromStakeRatio(stakeRatio);
	const userBoost = isValidStakeRatio ? calculateUserBoost(calculatedStakeRatio) : MIN_BOOST;
	const accountBoost = isValidAccountRatio ? calculateUserBoost(calculatedAccountRatio) : MIN_BOOST;

	return (
		<Grid container component={Paper} className={classes.root}>
			<StakeInformationHeader
				accountBoost={accountBoost}
				userBoost={userBoost}
				isLoading={isLoading}
				currentRank={currentRank}
				stakeRatio={stakeRatio}
				accountStakeRatio={accountStakeRatio}
			/>
			<Divider className={classes.divider} />
			<Grid container>
				<Grid item xs>
					<RankList
						currentStakeRatio={stakeRatio}
						accountStakeRatio={accountStakeRatio}
						onRankClick={onRankClick}
					/>
				</Grid>
			</Grid>
		</Grid>
	);
});
