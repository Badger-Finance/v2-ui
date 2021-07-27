import React from 'react';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

import { getColorFromComparison } from './utils';
import { BadgerBoostImage } from './BadgerBoostImage';
import { RankList } from './RankList';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { Skeleton } from '@material-ui/lab';
import { boostLevelByMatchingStakeRatio, calculateMultiplier, rankFromStakeRatio } from '../../utils/boost-ranks';

const useStakeStyles = (currentRatio?: number, accountRatio?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (currentRatio === undefined || !accountRatio) {
			return {
				fontColor: {
					color: theme.palette.text.primary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentRatio,
					toBeComparedValue: accountRatio,
					greaterCaseColor: theme.palette.error.main,
					lessCaseColor: '#74D189',
					defaultColor: theme.palette.text.primary,
				}),
			},
		};
	});
};

const useInformationPlaceholder = () => {
	const {
		wallet,
		user: { accountDetails },
	} = React.useContext(StoreContext);

	if (!wallet.connectedAddress) {
		return 'N/A';
	}

	if (!accountDetails) {
		return <Skeleton width={30} />;
	}

	return '-';
};

const useStyles = makeStyles((theme) => ({
	root: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		height: 470,
	},
	header: {
		height: 50,
	},
	rank: {
		marginRight: theme.spacing(1),
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			margin: theme.spacing(2, 0),
		},
		margin: theme.spacing(3, 0, 2, 0),
	},
	currentLevelImgContainer: {
		display: 'inline-block',
		width: 20,
		height: 20,
		margin: 'auto 4px auto 0',
	},
	fullWidthImage: {
		width: '100%',
		height: '100%',
	},
	currentLevelText: {
		fontSize: 12,
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
	badgerRankContainer: {
		marginTop: 2,
	},
}));

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
		} = React.useContext(StoreContext);

		const classes = useStyles();

		const stakeRatio = Number(native) / Number(nonNative);
		const isValidStakeRatio = isFinite(stakeRatio) && !isNaN(stakeRatio);
		const accountStakeRatio = Number(accountDetails?.nativeBalance) / Number(accountDetails?.nonNativeBalance);
		const rankClasses = useStakeStyles(stakeRatio, accountStakeRatio)();
		const infoPlaceholder = useInformationPlaceholder();

		const multiplier = calculateMultiplier(Number(native), Number(nonNative));
		const currentBadgerLevel = rankFromStakeRatio(stakeRatio);

		let stakeRatioInformation;

		if (isValidStakeRatio) {
			stakeRatioInformation = (
				<Typography variant="subtitle2" display="inline">
					{`${stakeRatio.toFixed(2)}`}
				</Typography>
			);
		}

		return (
			<Grid container component={Paper} className={classes.root}>
				<Grid container className={classes.header}>
					<Grid item xs={12} justify="space-between">
						<Typography variant="body2" color="textSecondary" display="inline">
							Your Stake Ratio:
						</Typography>{' '}
						{stakeRatioInformation || infoPlaceholder}
					</Grid>
					<Grid item xs={12} justify="space-between">
						<Typography variant="body2" color="textSecondary" display="inline">
							Your Multiplier:
						</Typography>{' '}
						<Typography variant="subtitle2" display="inline">
							{`${boostLevelByMatchingStakeRatio(stakeRatio).multiplier}x`}
						</Typography>
					</Grid>
					<Grid container item alignItems="center" xs={12} className={classes.badgerRankContainer}>
						<div className={classes.currentLevelImgContainer}>
							<BadgerBoostImage signatureColor={currentBadgerLevel.signatureColor} />
						</div>
						<Typography display="inline" variant="subtitle2" className={rankClasses.fontColor}>
							{currentBadgerLevel.name}
						</Typography>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<Grid container>
					<Grid item xs>
						<RankList
							currentMultiplier={multiplier}
							accountStakeRatio={accountStakeRatio}
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
						View Leaderboard
					</Button>
				</Grid>
			</Grid>
		);
	},
);
