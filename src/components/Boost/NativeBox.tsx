import { Grid, Tooltip, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { formatWithoutExtraZeros, numberWithCommas } from '../../mobx/utils/helpers';
import {
	calculateNativeToMatchRank,
	calculateUserBoost,
	getHighestRankFromStakeRatio,
	getNextBoostRank,
	isValidStakeRatio,
} from '../../utils/boost-ranks';
import { HoldingAssetInput } from './HoldingAssetInput';
import { useAssetInputStyles } from './utils';

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
	currentStakeRatio: number;
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
	const bveCVXBalance = user.accountDetails?.bveCvxBalance ?? 0;
	const nftBalance = user.accountDetails?.nftBalance ?? 0;
	const nativeHoldings = user.accountDetails?.nativeBalance ?? 0;
	const badgerDiggBalance = Math.max(nativeHoldings - nftBalance - bveCVXBalance, 0);

	const {
		nativeToAdd,
		currentStakeRatio,
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

	const isValidNativeToAdd = nativeToAdd && Number(nativeToAdd) !== 0;
	const showNativeToAdd = isValidNativeToAdd && isValidStakeRatio(currentStakeRatio);

	const currentRank = getHighestRankFromStakeRatio(currentStakeRatio);
	const nextBoostLevel = getNextBoostRank(currentRank);

	let nextStepText;
	let amountToReachNextLevel = 0;
	let shouldShowAmountToReachNextLevel = false;

	if (nextBoostLevel) {
		amountToReachNextLevel = calculateNativeToMatchRank(
			Number(nativeBalance),
			Number(nonNativeBalance),
			nextBoostLevel,
		);

		const nextUserBoost = calculateUserBoost(nextBoostLevel.stakeRatioBoundary);
		const native = Number(nativeBalance);
		shouldShowAmountToReachNextLevel = native !== 0 && amountToReachNextLevel > 0;
		nextStepText = `${nextUserBoost}x`;
	}

	const handleNextLevelAmountClick = () => {
		if (!isLoading && amountToReachNextLevel !== undefined) {
			onApplyNextLevelAmount(amountToReachNextLevel);
		}
	};

	const handleApplyNativeToAdd = () => {
		if (!isLoading && nativeToAdd) {
			onApplyNativeToAdd(nativeToAdd);
		}
	};

	const handleIncrement = () => {
		if (!isLoading) {
			onIncrement();
		}
	};

	const handleReduction = () => {
		if (!isLoading) {
			onReduction();
		}
	};

	return (
		<Grid item className={classes.settInformation}>
			<Typography variant="h6">Native: </Typography>
			<Typography variant="body2" color="textSecondary">
				Badger & Digg: ${numberWithCommas(formatWithoutExtraZeros(badgerDiggBalance, 3))}
			</Typography>
			<Typography variant="body2" color="textSecondary">
				NFTs: ${numberWithCommas(formatWithoutExtraZeros(nftBalance, 3))}
			</Typography>
			<Typography variant="body2" color="textSecondary">
				bveCVX: ${numberWithCommas(formatWithoutExtraZeros(bveCVXBalance, 3))}
			</Typography>
			<HoldingAssetInput
				className={classes.assetInput}
				disabled={isLoading}
				placeholder="$10,000"
				fullWidth={extraSmallScreen}
				InputProps={{
					className: nativeAssetClasses.assetColor,
				}}
				onChange={onChange}
				onIncrement={handleIncrement}
				onReduction={handleReduction}
				value={nativeBalance}
				inputProps={{ 'aria-label': 'native holdings amount' }}
				increaseAlt="increase native holdings"
				decreaseAlt="decrease native holdings"
			/>
			{shouldShowAmountToReachNextLevel && (
				<Grid className={classes.infoBox}>
					<Typography className={classes.infoText} color="textSecondary">
						Deposit
						<Tooltip enterTouchDelay={0} title="Apply" arrow placement="top" color="primary">
							<span
								className={classes.amountToNextLevel}
								onClick={handleNextLevelAmountClick}
							>{` $${numberWithCommas(formatWithoutExtraZeros(amountToReachNextLevel, 3))} `}</span>
						</Tooltip>
						more Native to reach next multiplier:{' '}
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
