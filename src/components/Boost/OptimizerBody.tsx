import React from 'react';
import { Grid, Tooltip, Typography, useMediaQuery, useTheme, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostBadgerAnimation } from './ScoreAnimation';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import BigNumber from 'bignumber.js';
import { getColorFromComparison } from './utils';
import { Skeleton } from '@material-ui/lab';
import { HoldingAssetInput } from './HoldingAssetInput';
import clsx from 'clsx';
import { formatWithoutExtraZeros, numberWithCommas } from '../../mobx/utils/helpers';
import { getRankNumberFromBoost, percentageBetweenRange } from '../../utils/componentHelpers';
import { LEADERBOARD_RANKS } from '../../config/constants';

const BoostLoader = withStyles((theme) => ({
	root: {
		margin: 'auto',
		width: 240,
		height: 240,
		borderRadius: 8,
		[theme.breakpoints.down('sm')]: {
			width: 160,
			height: 160,
		},
	},
}))(Skeleton);

const useAssetInputStyles = (currentValue: string, holdings: BigNumber.Value = 0) => {
	return makeStyles((theme) => {
		const defaultColor = currentValue ? theme.palette.text.primary : theme.palette.text.secondary;
		const fontColor = getColorFromComparison({
			toCompareValue: currentValue,
			toBeComparedValue: formatWithoutExtraZeros(holdings, 4),
			greaterCaseColor: '#74D189',
			lessCaseColor: theme.palette.error.main,
			defaultColor,
		});

		return {
			assetColor: {
				color: fontColor,
			},
		};
	});
};

const useValueIsGreater = (a?: number | string, b?: number | string): boolean => {
	if (a === undefined || b === undefined) {
		return false;
	}

	return Number(a) > Number(b);
};

const useAmountToReachNextLeaderboardRank = (
	boost: string,
	native: BigNumber.Value,
	nonNative: BigNumber.Value,
): BigNumber | undefined => {
	const { boostOptimizer } = React.useContext(StoreContext);
	const currentBadgerLevel = getRankNumberFromBoost(Number(boost));
	const nextBadgerLevel = LEADERBOARD_RANKS[currentBadgerLevel - 1];

	if (!nextBadgerLevel) {
		return undefined;
	}

	return boostOptimizer.calculateNativeToMatchBoost(native, nonNative, nextBadgerLevel.boostRangeStart);
};

const useShouldAmountReachNextLevel = (native: string, amountToReachNextLevel?: BigNumber): boolean => {
	if (!native || !amountToReachNextLevel) {
		return false;
	}

	return Number(native) !== 0 && amountToReachNextLevel.gt(native);
};

const useStyles = makeStyles((theme) => ({
	content: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginBottom: 0,
		},
	},
	settInformation: {
		width: '100%',
		textAlign: 'center',
	},
	valueToAddContainer: {
		marginTop: 8,
	},
	valueToAddText: {
		fontSize: 12,
	},
	amountToAdd: {
		cursor: 'pointer',
		color: '#74D189',
	},
	resetCalculation: {
		marginTop: theme.spacing(2),
		textAlign: 'center',
		textTransform: 'none',
	},
	resetCalculationText: {
		display: 'inline-block',
		textDecoration: 'underline',
	},
	resetCalculationIcon: {
		marginRight: 6,
	},
	infoBox: {
		marginTop: theme.spacing(2),
		border: '1px solid #6B6A6A',
		padding: theme.spacing(1),
		borderRadius: 8,
		textAlign: 'start',
	},
	infoText: {
		fontSize: 12,
	},
	nextLevelName: {
		color: '#3FC7FE',
	},
	amountToNextLevel: {
		cursor: 'pointer',
	},
	assetInput: {
		marginTop: theme.spacing(1),
	},
	bounce: {
		animation: '$bounce 1s ease-in-out 1',
	},
	'@keyframes bounce': {
		'0%': {
			transform: 'translateY(0)',
		},
		'30%': {
			transform: 'translateY(-5px)',
		},
		'50%': {
			transform: 'translateY(0)',
		},
		'100%': {
			transform: 'translateY(0)',
		},
	},
}));

type BoostCalculatorContainerProps = {
	boost: string;
	native: string;
	nativeToAdd?: string;
	nonNative: string;
	showMessageBounce?: boolean;
	onNativeChange(value: string): void;
	onNonNativeChange(value: string): void;
	onBounceAnimationEnd(): void;
};

export const OptimizerBody = observer(
	(props: BoostCalculatorContainerProps): JSX.Element => {
		const { boostOptimizer } = React.useContext(StoreContext);
		const { nativeHoldings, nonNativeHoldings } = boostOptimizer;
		const {
			boost,
			native,
			nonNative,
			nativeToAdd,
			onNonNativeChange,
			onNativeChange,
			onBounceAnimationEnd,
			showMessageBounce = false,
		} = props;

		const classes = useStyles();
		const theme = useTheme();
		const smallScreen = useMediaQuery(theme.breakpoints.down(706));
		const extraSmallScreen = useMediaQuery(theme.breakpoints.down(500));
		const nativeAssetClasses = useAssetInputStyles(native, nativeHoldings)();
		const nonNativeAssetClasses = useAssetInputStyles(nonNative, nonNativeHoldings)();

		const isLoading = nativeHoldings === undefined || nonNativeHoldings === undefined;
		const showEmptyNonNativeMessage = Number(nonNative) === 0;
		const showReducedNonNativeMessage = useValueIsGreater(nonNativeHoldings, nonNative);
		const showNativeToAdd = nativeToAdd && Number(nativeToAdd) !== 0;

		const sanitizedBoost = Math.min(Number(boost), 3);
		const badgerScore = percentageBetweenRange(sanitizedBoost, 3, 1);

		const currentBadgerLevel = getRankNumberFromBoost(Number(boost));
		const nextBadgerLevel = LEADERBOARD_RANKS[currentBadgerLevel - 1];

		const amountToReachNextLevel = useAmountToReachNextLeaderboardRank(boost, native, nonNative);
		const shouldShowAmountToReachNextLevel = useShouldAmountReachNextLevel(native, amountToReachNextLevel);

		const handleApplyRemaining = () => {
			if (isLoading || !native || !nativeToAdd) return;

			const increasedNative = Number(native) + Number(nativeToAdd);
			onNativeChange(increasedNative.toString());
		};

		const handleApplyNextLevelAmount = () => {
			if (isLoading || !native || !amountToReachNextLevel) return;

			onNativeChange(formatWithoutExtraZeros(amountToReachNextLevel.plus(native)));
		};

		const handleIncreaseNative = () => {
			if (isLoading || !native) return;

			const increasedNative = Number(native) + 1000;
			onNativeChange(increasedNative.toString());
		};

		const handleReduceNative = () => {
			if (isLoading || !native) return;

			const reducedNative = Number(native) - 1000;
			const sanitizedReducedNative = Math.max(reducedNative, 0);
			onNativeChange(sanitizedReducedNative.toString());
		};

		const handleIncreaseNonNative = () => {
			if (isLoading || !nonNative) return;

			const increaseNonNative = Number(nonNative) + 1000;
			onNonNativeChange(increaseNonNative.toString());
		};

		const handleReduceNonNative = () => {
			if (isLoading || !nonNative) return;

			const reducedNonNative = Number(nonNative) - 1000;
			const sanitizedReducedNonNative = Math.max(reducedNonNative, 0);
			onNonNativeChange(sanitizedReducedNonNative.toString());
		};

		const badgerScoreContent = isLoading ? (
			<BoostLoader variant="rect" />
		) : (
			<BoostBadgerAnimation score={badgerScore} />
		);

		const nativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Native: </Typography>
				<HoldingAssetInput
					className={classes.assetInput}
					disabled={isLoading}
					placeholder="$10,000"
					fullWidth={extraSmallScreen}
					InputProps={{
						className: nativeAssetClasses.assetColor,
					}}
					onChange={onNativeChange}
					onIncrement={handleIncreaseNative}
					onReduction={handleReduceNative}
					value={native}
				/>
				{nextBadgerLevel && amountToReachNextLevel && shouldShowAmountToReachNextLevel && (
					<Grid className={classes.infoBox}>
						<Typography className={classes.infoText} color="textSecondary">
							Deposit
							<Tooltip title="Apply" arrow placement="top" color="primary">
								<span
									className={classes.amountToNextLevel}
									onClick={handleApplyNextLevelAmount}
								>{` $${numberWithCommas(formatWithoutExtraZeros(amountToReachNextLevel, 3))} `}</span>
							</Tooltip>
							more Native to reach next rank:
							<span className={classes.nextLevelName}>{` ${nextBadgerLevel.name}`}</span>
						</Typography>
					</Grid>
				)}
				{nativeToAdd && showNativeToAdd && (
					<Grid className={classes.valueToAddContainer} container direction="column">
						<Typography className={classes.valueToAddText}>Value to Add</Typography>
						<Typography
							className={clsx(classes.valueToAddText, classes.amountToAdd)}
							onClick={handleApplyRemaining}
						>{`+$${numberWithCommas(formatWithoutExtraZeros(nativeToAdd, 3))}`}</Typography>
					</Grid>
				)}
			</Grid>
		);

		const nonNativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Non Native: </Typography>
				<HoldingAssetInput
					className={classes.assetInput}
					disabled={isLoading}
					placeholder="$5,000"
					fullWidth={extraSmallScreen}
					InputProps={{
						className: nonNativeAssetClasses.assetColor,
					}}
					onChange={onNonNativeChange}
					onIncrement={handleIncreaseNonNative}
					onReduction={handleReduceNonNative}
					value={nonNative}
				/>
				{showReducedNonNativeMessage && (
					<Grid className={classes.infoBox}>
						<Typography className={classes.infoText} color="textSecondary">
							While reducing Non-Native may increase your boost, your gross yield will be smaller
						</Typography>
					</Grid>
				)}
				{showEmptyNonNativeMessage && (
					<Grid
						className={clsx(classes.infoBox, showMessageBounce && classes.bounce)}
						onAnimationEnd={onBounceAnimationEnd}
					>
						<Typography className={classes.infoText} color="textSecondary">
							You need to have Non Native assets in order to improve your boost
						</Typography>
					</Grid>
				)}
			</Grid>
		);

		if (smallScreen) {
			return (
				<Grid container spacing={2} className={classes.content}>
					<Grid item xs={12}>
						{badgerScoreContent}
					</Grid>
					<Grid item xs={extraSmallScreen ? 12 : 6}>
						{nativeBox}
					</Grid>
					<Grid item xs={extraSmallScreen ? 12 : 6}>
						{nonNativeBox}
					</Grid>
				</Grid>
			);
		}

		return (
			<Grid container className={classes.content}>
				<Grid item xs>
					{nativeBox}
				</Grid>
				<Grid item xs={5}>
					{badgerScoreContent}
				</Grid>
				<Grid item xs>
					{nonNativeBox}
				</Grid>
			</Grid>
		);
	},
);
