import React from 'react';
import { Button, Grid, Typography, useMediaQuery, useTheme, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostBadgerAnimation } from './BoostBadgerAnimation';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import BigNumber from 'bignumber.js';
import { formatWithoutExtraZeros, getColorFromComparison } from './utils';
import { Skeleton } from '@material-ui/lab';
import { HoldingAssetInput } from './HoldingAssetInput';
import { numberWithCommas } from '../../mobx/utils/helpers';
import clsx from 'clsx';

const BoostLoader = withStyles(() => ({
	root: {
		margin: 'auto',
		width: 240,
		height: 240,
		borderRadius: 8,
	},
}))(Skeleton);

const useAssetInputStyles = (currentValue: string, holdings?: BigNumber.Value) => {
	return makeStyles((theme) => {
		const defaultColor = currentValue ? theme.palette.text.primary : theme.palette.text.secondary;
		const fontColor = getColorFromComparison({
			toCompareValue: currentValue,
			toBeComparedValue: holdings || 0,
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
	actionButton: {
		borderRadius: 2,
		height: 48,
		[theme.breakpoints.up(500)]: {
			width: 28,
			height: 28,
			minWidth: 28,
		},
	},
	actionImage: {
		[theme.breakpoints.down(500)]: {
			width: 16,
		},
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
		marginTop: 16,
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
}));

type BoostCalculatorContainerProps = {
	native: string;
	nativeToAdd?: string;
	nonNative: string;
	onNativeChange(value: string): void;
	onNonNativeChange(value: string): void;
	onReset(): void;
};

export const BoostCalculatorContainer = observer(
	(props: BoostCalculatorContainerProps): JSX.Element => {
		const { boostOptimizer } = React.useContext(StoreContext);
		const { nativeHoldings, nonNativeHoldings } = boostOptimizer;
		const { native, nonNative, nativeToAdd, onNonNativeChange, onNativeChange, onReset } = props;

		const classes = useStyles();
		const nativeAssetClasses = useAssetInputStyles(native, nativeHoldings)();
		const theme = useTheme();
		const smallScreen = useMediaQuery(theme.breakpoints.down(706));
		const extraSmallScreen = useMediaQuery(theme.breakpoints.down(500));
		const nonNativeAssetClasses = useAssetInputStyles(nonNative, nonNativeHoldings)();

		const isLoading = !nativeHoldings || !nonNativeHoldings;

		const isThereRemainingToAdd = nativeToAdd ? Number(nativeToAdd) > Number(native) : undefined;
		const remainingNativeToAdd = isThereRemainingToAdd ? Number(nativeToAdd) - Number(native) : undefined;

		const boostRatio = boostOptimizer.calculateBoostRatio(native, nonNative);
		const badgerScore = boostRatio ? Math.max(boostRatio / 3, 0) : 0;
		const badgerScoreRatio = Math.min(badgerScore * 100, 100);

		const handleApplyRemaining = () => {
			if (native && remainingNativeToAdd) {
				onNativeChange(formatWithoutExtraZeros(new BigNumber(native).plus(remainingNativeToAdd)));
			}
		};

		const handleIncreaseNative = () => {
			if (native) {
				onNativeChange(formatWithoutExtraZeros(new BigNumber(native).plus(1000)));
			}
		};

		const handleDecreaseNative = () => {
			if (native) {
				const decrementedNative = new BigNumber(native).minus(1000);
				onNativeChange(formatWithoutExtraZeros(BigNumber.max(decrementedNative, 0)));
			}
		};

		const handleIncreaseNonNative = () => {
			if (nonNative) {
				onNonNativeChange(formatWithoutExtraZeros(new BigNumber(nonNative).plus(1000)));
			}
		};

		const handleDecreaseNonNative = () => {
			if (nonNative) {
				const decrementedNonNative = new BigNumber(nonNative).minus(1000);
				onNonNativeChange(formatWithoutExtraZeros(BigNumber.max(decrementedNonNative, 0)));
			}
		};

		const badgerScoreContent = (
			<>
				{isLoading ? <BoostLoader variant="rect" /> : <BoostBadgerAnimation score={badgerScoreRatio} />}
				<Grid container justify="center">
					<Button className={classes.resetCalculation} color="primary" onClick={onReset}>
						<img
							className={classes.resetCalculationIcon}
							src="assets/icons/reset-boost.svg"
							alt="reset boost"
						/>
						<Typography className={classes.resetCalculationText} variant="subtitle1" color="primary">
							Reset Calculation
						</Typography>
					</Button>
				</Grid>
			</>
		);

		const nativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Native: </Typography>
				<HoldingAssetInput
					disabled={isLoading}
					value={native}
					placeholder="$10,000"
					fullWidth={extraSmallScreen}
					InputProps={{
						className: nativeAssetClasses.assetColor,
						startAdornment: (
							<Button className={classes.actionButton} onClick={handleIncreaseNative}>
								<img
									className={classes.actionImage}
									src="/assets/icons/boost-up.svg"
									alt="increase native holdings"
								/>
							</Button>
						),
						endAdornment: (
							<Button className={classes.actionButton} onClick={handleDecreaseNative}>
								<img
									className={classes.actionImage}
									src="/assets/icons/boost-down.svg"
									alt="decrease native holdings"
								/>
							</Button>
						),
					}}
					onChange={onNativeChange}
				/>
				{remainingNativeToAdd && (
					<Grid className={classes.valueToAddContainer} container direction="column">
						<Typography className={classes.valueToAddText}>Value to Add</Typography>
						<Typography
							className={clsx(classes.valueToAddText, classes.amountToAdd)}
							onClick={handleApplyRemaining}
						>{`+$${numberWithCommas(remainingNativeToAdd.toFixed(3).toString())}`}</Typography>
					</Grid>
				)}
			</Grid>
		);

		const nonNativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Non Native: </Typography>
				<HoldingAssetInput
					disabled={isLoading}
					value={nonNative}
					placeholder="$5,000"
					fullWidth={extraSmallScreen}
					InputProps={{
						className: nonNativeAssetClasses.assetColor,
						startAdornment: (
							<Button className={classes.actionButton} onClick={handleIncreaseNonNative}>
								<img
									className={classes.actionImage}
									src="/assets/icons/boost-up.svg"
									alt="increase non-native holdings"
								/>
							</Button>
						),
						endAdornment: (
							<Button className={classes.actionButton} onClick={handleDecreaseNonNative}>
								<img
									className={classes.actionImage}
									src="/assets/icons/boost-down.svg"
									alt="decrease non-native holdings"
								/>
							</Button>
						),
					}}
					onChange={onNonNativeChange}
				/>
			</Grid>
		);

		if (smallScreen) {
			return (
				<Grid container spacing={4} className={classes.content} alignItems="center" justify="center">
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
			<Grid container className={classes.content} alignItems="center" justify="center">
				<Grid item xs>
					{nativeBox}
				</Grid>
				<Grid item xs={6}>
					{badgerScoreContent}
				</Grid>
				<Grid item xs>
					{nonNativeBox}
				</Grid>
			</Grid>
		);
	},
);
