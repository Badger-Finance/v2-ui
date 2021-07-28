import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import { Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { HoldingAssetInput } from './HoldingAssetInput';
import { formatWithoutExtraZeros, numberWithCommas } from '../../mobx/utils/helpers';
import { useAssetInputStyles } from './utils';
import { StoreContext } from '../../mobx/store-context';
import {
	calculateNativeToMatchBoost,
	getRankAndLevelInformationFromStat,
	isValidMultiplier,
} from '../../utils/boost-ranks';
import { BOOST_LEVELS, BOOST_RANKS } from '../../config/system/boost-ranks';

const useStyles = makeStyles((theme) => ({
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
}));

interface Props {
	isLoading: boolean;
	currentMultiplier: string;
	nativeBalance: string;
	nonNativeBalance: string;
	nativeToAdd?: string;
	onChange: (change: string) => void;
	onIncrement: () => void;
	onReduction: () => void;
	onApplyNextLevelAmount: (amount: number) => void;
	onApplyNativeToAdd: (amount: string) => void;
}

export const NativeBox = observer((props: Props) => {
	const { user } = React.useContext(StoreContext);
	const nativeHoldings = user.accountDetails?.nativeBalance;

	const {
		nativeToAdd,
		currentMultiplier,
		nativeBalance,
		nonNativeBalance,
		isLoading,
		onChange,
		onIncrement,
		onReduction,
		onApplyNextLevelAmount,
		onApplyNativeToAdd,
	} = props;

	const classes = useStyles();
	const theme = useTheme();
	const extraSmallScreen = useMediaQuery(theme.breakpoints.down(500));
	const nativeAssetClasses = useAssetInputStyles(nativeBalance, nativeHoldings)();

	const showNativeToAdd = nativeToAdd && Number(nativeToAdd) !== 0 && isValidMultiplier(Number(currentMultiplier));

	const [currentRankNumber, currentLevelNumber] = getRankAndLevelInformationFromStat(
		Number(currentMultiplier),
		'multiplier',
	);

	const currentBoostLevel = BOOST_RANKS[currentRankNumber].levels[currentLevelNumber];
	const currentBoostLevelIndex = BOOST_LEVELS.findIndex(
		(_level) => _level.stakeRatioBoundary === currentBoostLevel.stakeRatioBoundary,
	);
	const nextBoostLevel = BOOST_LEVELS[currentBoostLevelIndex + 1];

	let nextStepText;
	let amountToReachNextLevel = 0;
	let shouldShowAmountToReachNextLevel = false;

	if (nextBoostLevel) {
		amountToReachNextLevel = calculateNativeToMatchBoost(
			Number(nativeBalance),
			Number(nonNativeBalance),
			nextBoostLevel.multiplier,
		);

		const native = Number(nativeBalance);
		shouldShowAmountToReachNextLevel = native !== 0 && amountToReachNextLevel > native;
		nextStepText = `${nextBoostLevel.multiplier}x`;
	}

	const handleNextLevelAmountClick = () => {
		if (amountToReachNextLevel !== undefined) {
			onApplyNextLevelAmount(amountToReachNextLevel);
		}
	};

	const handleApplyNativeToAdd = () => {
		if (nativeToAdd) {
			onApplyNativeToAdd(nativeToAdd);
		}
	};

	return (
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
				onChange={onChange}
				onIncrement={onIncrement}
				onReduction={onReduction}
				value={nativeBalance}
				inputProps={{ 'aria-label': 'native holdings amount' }}
				increaseAlt="increase native holdings"
				decreaseAlt="decrease native holdings"
			/>
			{amountToReachNextLevel !== undefined &&
				nextBoostLevel &&
				shouldShowAmountToReachNextLevel &&
				nextStepText && (
					<Grid className={classes.infoBox}>
						<Typography className={classes.infoText} color="textSecondary">
							Deposit
							<Tooltip title="Apply" arrow placement="top" color="primary">
								<span
									className={classes.amountToNextLevel}
									onClick={handleNextLevelAmountClick}
								>{` $${numberWithCommas(formatWithoutExtraZeros(amountToReachNextLevel, 3))} `}</span>
							</Tooltip>
							more Native to reach next rank:
							<span className={classes.nextLevelName}>{nextStepText}</span>
						</Typography>
					</Grid>
				)}
			{nativeToAdd && showNativeToAdd && (
				<Grid className={classes.valueToAddContainer} container direction="column">
					<Typography className={classes.valueToAddText}>Value to Add</Typography>
					<Typography
						className={clsx(classes.valueToAddText, classes.amountToAdd)}
						onClick={handleApplyNativeToAdd}
					>{`+$${numberWithCommas(formatWithoutExtraZeros(nativeToAdd, 3))}`}</Typography>
				</Grid>
			)}
		</Grid>
	);
});
