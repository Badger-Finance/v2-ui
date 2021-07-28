import React from 'react';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

import { getColorFromComparison } from './utils';
import { BadgerBoostImage } from './BadgerBoostImage';
import { RankList } from './RankList';
import { StoreContext } from '../../mobx/store-context';
import routes from '../../config/routes';
import { Skeleton } from '@material-ui/lab';
import { calculateMultiplier, rankFromMultiplier } from '../../utils/boost-ranks';
import { BOOST_LEVELS } from '../../config/system/boost-ranks';
import clsx from 'clsx';

const useComparedValuesStyles = (currentRatio: number, accountRatio: number) => {
	return makeStyles((theme) => {
		if (isNaN(currentRatio) || isNaN(accountRatio)) {
			return {
				fontColor: {
					color: theme.palette.text.primary,
				},
			};
		}

		console.log({ currentRatio, accountRatio });

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentRatio,
					toBeComparedValue: accountRatio,
					greaterCaseColor: '#74D189',
					lessCaseColor: theme.palette.error.main,
					defaultColor: theme.palette.text.primary,
				}),
			},
		};
	});
};

const useInformationPlaceholder = (defaultValue: string) => {
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

	return defaultValue;
};

const useStyles = makeStyles((theme) => ({
	root: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		height: 503,
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
	currentLevelImgContainer: {
		display: 'inline-block',
		width: 24,
		height: 24,
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
	accountInformationContainer: {
		marginTop: theme.spacing(2),
	},
	rankName: {
		fontSize: 16,
		fontWeight: 600,
	},
	informationValue: {
		fontSize: 16,
		fontWeight: 600,
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

		const accountStakeRatio = accountDetails?.stakeRatio || 0;
		const accountComparativeClasses = useComparedValuesStyles(stakeRatio, accountStakeRatio)();
		const stakeRatioPlaceHolder = useInformationPlaceholder(`${BOOST_LEVELS[0].stakeRatioBoundary * 100}%`);

		const multiplier = calculateMultiplier(Number(native), Number(nonNative));
		const currentRank = rankFromMultiplier(multiplier);
		const multiplierPlaceHolder = useInformationPlaceholder(`${BOOST_LEVELS[0].multiplier}x`);

		let stakeRatioInformation;
		let multiplierInformation;

		if (isValidStakeRatio) {
			stakeRatioInformation = `${Number((stakeRatio * 100).toFixed(2))}%`;
			multiplierInformation = `${multiplier}x`;
		}

		return (
			<Grid container component={Paper} className={classes.root}>
				<Grid container>
					<Grid container alignItems="center">
						<div className={classes.currentLevelImgContainer}>
							<BadgerBoostImage signatureColor={currentRank.signatureColor} />
						</div>
						<Typography display="inline" className={classes.rankName}>
							{currentRank.name}
						</Typography>
					</Grid>
					<Grid container className={classes.accountInformationContainer}>
						<Grid container item xs={6}>
							<Grid item xs={12}>
								<Typography variant="subtitle2" color="textSecondary">
									Stake Ratio:
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography
									className={clsx(classes.informationValue, accountComparativeClasses.fontColor)}
								>
									{stakeRatioInformation || stakeRatioPlaceHolder}
								</Typography>
							</Grid>
						</Grid>
						<Grid container item xs={6}>
							<Grid item xs={12}>
								<Typography variant="subtitle2" color="textSecondary">
									Multiplier:
								</Typography>
							</Grid>
							<Grid item xs={12}>
								<Typography
									className={clsx(classes.informationValue, accountComparativeClasses.fontColor)}
								>
									{multiplierInformation || multiplierPlaceHolder}
								</Typography>
							</Grid>
						</Grid>
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
