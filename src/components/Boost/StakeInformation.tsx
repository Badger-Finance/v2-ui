import React from 'react';
import { Button, Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

import { rankAndLevelFromStakeRatio } from '../../utils/boost-ranks';
import { RankList } from './RankList';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';
import { StakeInformationHeader } from './StakeInformationHeader';
import { roundWithDecimals } from '../../utils/componentHelpers';

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
const roundValue = (value: number | string | undefined) => roundWithDecimals(Number(value), 4);

interface Props {
	native?: string;
	nonNative?: string;
	onRankClick: (boost: number) => void;
}

export const StakeInformation = observer(
	({ native, nonNative, onRankClick }: Props): JSX.Element => {
		const {
			router,
			user: { accountDetails },
			wallet: { connectedAddress },
		} = React.useContext(StoreContext);

		const classes = useStyles();

		const isLoading = !!connectedAddress && accountDetails === undefined;
		const accountNative = accountDetails?.nativeBalance;
		const accountNonNative = accountDetails?.nonNativeBalance;

		// round both values to make sure there is no difference caused by decimals
		const calculatedStakeRatio = (roundValue(native) / roundValue(nonNative)) * 100;
		const calculatedAccountRatio = (roundValue(accountNative) / roundValue(accountNonNative)) * 100;

		const isValidStakeRatio = isValidCalculatedValue(calculatedStakeRatio);
		const isValidAccountRatio = isValidCalculatedValue(calculatedAccountRatio);

		const stakeRatio = isValidStakeRatio ? calculatedStakeRatio : MIN_BOOST_LEVEL.stakeRatioBoundary;
		const accountStakeRatio = isValidAccountRatio ? calculatedAccountRatio : MIN_BOOST_LEVEL.stakeRatioBoundary;

		const [currentRank, currentLevel] = rankAndLevelFromStakeRatio(stakeRatio);
		const { 1: accountLevel } = rankAndLevelFromStakeRatio(accountStakeRatio);

		return (
			<Grid container component={Paper} className={classes.root}>
				<StakeInformationHeader
					isLoading={isLoading}
					currentRank={currentRank}
					stakeRatio={stakeRatio}
					accountStakeRatio={accountStakeRatio}
					multiplier={currentLevel.multiplier}
					accountMultiplier={accountLevel.multiplier}
				/>
				<Divider className={classes.divider} />
				<Grid container>
					<Grid item xs>
						<RankList
							currentMultiplier={currentLevel.multiplier}
							accountMultiplier={accountLevel.multiplier}
							onRankClick={onRankClick}
						/>
					</Grid>
				</Grid>

				<Grid container className={classes.viewLeaderBoardContainer}>
					<Button
						fullWidth
						color="primary"
						variant="outlined"
						size="small"
						onClick={() => {
							router.goTo(routes.boostLeaderBoard);
						}}
					>
						View Stake ratio multipliers
					</Button>
				</Grid>
			</Grid>
		);
	},
);
