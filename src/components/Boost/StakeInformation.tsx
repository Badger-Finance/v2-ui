import React from 'react';
import { Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { calculateUserBoost, getHighestRankFromStakeRatio } from '../../utils/boost-ranks';
import { RankList } from './RankList';
import { StoreContext } from '../../mobx/store-context';
import { MIN_BOOST_RANK } from '../../config/system/boost-ranks';
import { StakeInformationHeader } from './StakeInformationHeader';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';

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

const isValidCalculatedValue = (value: number) => isFinite(value) && !isNaN(value);

interface Props {
	native?: string;
	nonNative?: string;
	onRankClick: (rank: BoostRank) => void;
}

export const StakeInformation = observer(({ native, nonNative, onRankClick }: Props): JSX.Element => {
	const {
		user: { accountDetails },
		onboard,
	} = React.useContext(StoreContext);

	const classes = useStyles();

	const isLoading = onboard.isActive() && accountDetails === undefined;
	const accountNative = accountDetails?.nativeBalance;
	const accountNonNative = accountDetails?.nonNativeBalance;

	const calculatedStakeRatio = Number(native) / Number(nonNative);
	const calculatedAccountRatio = Number(accountNative) / Number(accountNonNative);

	const isValidStakeRatio = isValidCalculatedValue(calculatedStakeRatio);
	const isValidAccountRatio = isValidCalculatedValue(calculatedAccountRatio);

	const stakeRatio = isValidStakeRatio ? calculatedStakeRatio : MIN_BOOST_RANK.stakeRatioBoundary;
	const accountStakeRatio = isValidAccountRatio ? calculatedAccountRatio : MIN_BOOST_RANK.stakeRatioBoundary;

	const currentRank = getHighestRankFromStakeRatio(stakeRatio);
	const userBoost = isValidStakeRatio ? calculateUserBoost(calculatedStakeRatio) : 0;
	const accountBoost = isValidAccountRatio ? calculateUserBoost(calculatedAccountRatio) : 0;

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
