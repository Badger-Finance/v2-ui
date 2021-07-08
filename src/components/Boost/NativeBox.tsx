import React from 'react';
import BigNumber from 'bignumber.js';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

import { Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { HoldingAssetInput } from './HoldingAssetInput';
import { formatWithoutExtraZeros, numberWithCommas } from '../../mobx/utils/helpers';
import { getRankNumberFromBoost } from '../../utils/componentHelpers';
import { LEADERBOARD_RANKS } from '../../config/constants';
import { useAssetInputStyles } from './utils';
import { StoreContext } from '../../mobx/store-context';

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

interface Props {
	isLoading: boolean;
	currentBoost: string;
	nativeBalance: string;
	nonNativeBalance: string;
	nativeToAdd?: string;
	onChange: (change: string) => void;
	onIncrement: () => void;
	onReduction: () => void;
	onApplyNextLevelAmount: (amount: BigNumber) => void;
	onApplyNativeToAdd: (amount: string) => void;
}

export const NativeBox = observer((props: Props) => {
	const { user } = React.useContext(StoreContext);
	const nativeHoldings = user.accountDetails?.nativeBalance;

	const {
		nativeToAdd,
		currentBoost,
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

	const showNativeToAdd = nativeToAdd && Number(nativeToAdd) !== 0;
	const currentBadgerLevel = getRankNumberFromBoost(Number(currentBoost));
	const nextBadgerLevel = LEADERBOARD_RANKS[currentBadgerLevel - 1];
	const amountToReachNextLevel = useAmountToReachNextLeaderboardRank(currentBoost, nativeBalance, nonNativeBalance);
	const shouldShowAmountToReachNextLevel = useShouldAmountReachNextLevel(nativeBalance, amountToReachNextLevel);

	const handleNextLevelAmountClick = () => {
		if (amountToReachNextLevel) {
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
			/>
			{nextBadgerLevel && amountToReachNextLevel && shouldShowAmountToReachNextLevel && (
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
						<span className={classes.nextLevelName}>{` ${nextBadgerLevel.name}`}</span>
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
