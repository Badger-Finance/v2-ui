import React from 'react';
import { Button, Grid, InputAdornment, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BoostBadgerAnimation } from './BoostBadgerAnimation';
import { useNumericInput } from '../../utils/useNumericInput';
import { AssetInput } from './Common';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import BigNumber from 'bignumber.js';

const useAssetInputStyles = (currentValue: BigNumber.Value, holdings?: BigNumber.Value) => {
	return makeStyles((theme) => {
		currentValue = new BigNumber(currentValue);
		holdings = new BigNumber(holdings || 0);

		let fontColor = currentValue.isNaN() ? theme.palette.text.secondary : theme.palette.text.primary;
		if (currentValue.gt(holdings)) fontColor = '#74D189 ';
		if (currentValue.lt(holdings)) fontColor = '#F44336';

		return {
			assetColor: {
				color: fontColor,
			},
			dollarAdornment: {
				margin: '0px 0px 0px 2px',
				'& > *': {
					fontSize: 20,
					color: fontColor,
					[theme.breakpoints.down(500)]: {
						fontSize: 24,
					},
				},
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
	boostSlider: {
		padding: '0 22px !important',
		height: 'auto !important',
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
}));

type BoostCalculatorContainerProps = {
	native: string;
	nonNative: string;
	onNativeChange(value: string): void;
	onNonNativeChange(value: string): void;
};

export const BoostCalculatorContainer = observer(
	(props: BoostCalculatorContainerProps): JSX.Element => {
		const {
			boostOptimizer: { nativeHoldings, nonNativeHoldings },
		} = React.useContext(StoreContext);

		const { native, nonNative, onNonNativeChange, onNativeChange } = props;
		const classes = useStyles();
		const { onValidChange, inputProps } = useNumericInput();
		const nativeAssetClasses = useAssetInputStyles(native, nativeHoldings)();
		const theme = useTheme();
		const smallScreen = useMediaQuery(theme.breakpoints.down(706));
		const extraSmallScreen = useMediaQuery(theme.breakpoints.down(500));
		const nonNativeAssetClasses = useAssetInputStyles(nonNative, nonNativeHoldings)();

		const boostRatio = new BigNumber(native).dividedToIntegerBy(nonNative);
		const boostRatioPercentage = boostRatio.dividedToIntegerBy(3).multipliedBy(100);
		const badgerScore = Math.min(boostRatioPercentage.toNumber(), 100);

		const handleIncreaseNative = () => {
			if (native) {
				onNativeChange(new BigNumber(native).multipliedBy(1.1).toString());
			}
		};

		const handleDecreaseNative = () => {
			if (native) {
				onNativeChange(new BigNumber(native).multipliedBy(0.9).toString());
			}
		};

		const handleIncreaseNonNative = () => {
			if (nonNative) {
				onNonNativeChange(new BigNumber(nonNative).multipliedBy(1.1).toString());
			}
		};

		const handleDecreaseNonNative = () => {
			if (nonNative) {
				onNonNativeChange(new BigNumber(nonNative).multipliedBy(0.9).toString());
			}
		};

		const nativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Native: </Typography>
				<AssetInput
					classes={{ adornedStart: nativeAssetClasses.assetColor }}
					className={nativeAssetClasses.assetColor}
					disabled={!nativeHoldings}
					value={native}
					placeholder="10,000"
					inputProps={inputProps}
					fullWidth={extraSmallScreen}
					startAdornment={
						<>
							<Button className={classes.actionButton} onClick={handleIncreaseNative}>
								<img
									className={classes.actionImage}
									src="/assets/icons/boost-up.svg"
									alt="increase native holdings"
								/>
							</Button>
							<InputAdornment
								classes={{
									root: nativeAssetClasses.dollarAdornment,
								}}
								position="start"
							>
								$
							</InputAdornment>
						</>
					}
					endAdornment={
						<Button className={classes.actionButton} onClick={handleDecreaseNative}>
							<img
								className={classes.actionImage}
								src="/assets/icons/boost-down.svg"
								alt="decrease native holdings"
							/>
						</Button>
					}
					onChange={onValidChange(onNativeChange)}
				/>
			</Grid>
		);

		const nonNativeBox = (
			<Grid item className={classes.settInformation}>
				<Typography variant="h6">Non Native: </Typography>
				<AssetInput
					className={nonNativeAssetClasses.assetColor}
					disabled={!nonNativeHoldings}
					value={nonNative}
					placeholder="5,000"
					inputProps={inputProps}
					fullWidth={extraSmallScreen}
					startAdornment={
						<>
							<Button className={classes.actionButton} onClick={handleIncreaseNonNative}>
								<img
									className={classes.actionImage}
									src="/assets/icons/boost-up.svg"
									alt="increase non-native holdings"
								/>
							</Button>
							<InputAdornment
								classes={{
									root: nonNativeAssetClasses.dollarAdornment,
								}}
								position="start"
							>
								$
							</InputAdornment>
						</>
					}
					endAdornment={
						<Button className={classes.actionButton} onClick={handleDecreaseNonNative}>
							<img
								className={classes.actionImage}
								src="/assets/icons/boost-down.svg"
								alt="decrease non-native holdings"
							/>
						</Button>
					}
					onChange={onValidChange(onNonNativeChange)}
				/>
			</Grid>
		);

		if (smallScreen) {
			return (
				<Grid container spacing={4} className={classes.content} alignItems="center" justify="center">
					<Grid item xs={12}>
						<BoostBadgerAnimation score={badgerScore} />
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
					<BoostBadgerAnimation score={badgerScore} />
				</Grid>
				<Grid item xs>
					{nonNativeBox}
				</Grid>
			</Grid>
		);
	},
);
