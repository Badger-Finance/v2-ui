import { Grid, useMediaQuery, useTheme, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Skeleton } from '@material-ui/lab';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StoreContext } from '../../mobx/store-context';
import { clampStakeRatio } from '../../utils/boost-ranks';
import { NativeBox } from './NativeBox';
import { NonNativeBox } from './NonNativeBox';
import { BoostBadgerAnimation } from './ScoreAnimation';

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

const useStyles = makeStyles((theme) => ({
	content: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(3),
		[theme.breakpoints.down('sm')]: {
			marginBottom: 0,
		},
	},
}));

type OptimizerBodyProps = {
	stakeRatio: number;
	native: string;
	nativeToAdd?: string;
	nonNative: string;
	showMessageBounce?: boolean;
	onNativeChange(value: string): void;
	onNonNativeChange(value: string): void;
	onBounceAnimationEnd(): void;
};

export const OptimizerBody = observer((props: OptimizerBodyProps): JSX.Element => {
	const {
		user: { accountDetails },
		wallet,
	} = React.useContext(StoreContext);

	const {
		stakeRatio,
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

	const isLoading = wallet.isConnected && accountDetails === undefined;
	const clampedStakeRatio = clampStakeRatio(Number(stakeRatio));

	const handleApplyRemaining = (amountToAdd: string) => {
		const increasedNative = Number(native) + Number(amountToAdd);

		if (isNaN(increasedNative)) {
			return;
		}

		onNativeChange(Math.floor(increasedNative).toString());
	};

	const handleApplyNextLevelAmount = (amountToReachNextLevel: number) => {
		const amountToReach = amountToReachNextLevel + Number(native);

		if (isNaN(Number(amountToReach))) {
			return;
		}

		onNativeChange(amountToReach.toFixed(4));
	};

	const handleIncreaseNative = () => {
		const increasedNative = Number(native) + 1000;

		if (isNaN(increasedNative)) {
			return;
		}

		onNativeChange(Math.floor(increasedNative).toString());
	};

	const handleReduceNative = () => {
		const reducedNative = Number(native) - 1000;

		if (isNaN(reducedNative)) {
			return;
		}

		const sanitizedReducedNative = Math.max(reducedNative, 0);
		onNativeChange(Math.floor(sanitizedReducedNative).toString());
	};

	const handleIncreaseNonNative = () => {
		const increaseNonNative = Number(nonNative) + 1000;

		if (isNaN(increaseNonNative)) {
			return;
		}

		onNonNativeChange(Math.floor(increaseNonNative).toString());
	};

	const handleReduceNonNative = () => {
		const reducedNonNative = Number(nonNative) - 1000;

		if (isNaN(reducedNonNative)) {
			return;
		}

		const sanitizedReducedNonNative = Math.max(reducedNonNative, 0);
		onNonNativeChange(Math.floor(sanitizedReducedNonNative).toString());
	};

	const badgerScoreContent = isLoading ? (
		<BoostLoader variant="rect" />
	) : (
		<BoostBadgerAnimation stakeRatio={clampedStakeRatio} />
	);

	const nativeBox = (
		<NativeBox
			currentStakeRatio={stakeRatio}
			nativeBalance={native}
			nonNativeBalance={nonNative}
			isLoading={isLoading}
			nativeToAdd={nativeToAdd}
			onChange={onNativeChange}
			onIncrement={handleIncreaseNative}
			onReduction={handleReduceNative}
			onApplyNextLevelAmount={handleApplyNextLevelAmount}
			onApplyNativeToAdd={handleApplyRemaining}
		/>
	);

	const nonNativeBox = (
		<NonNativeBox
			isLoading={isLoading}
			nonNativeBalance={nonNative}
			showMessageBounce={showMessageBounce}
			onChange={onNonNativeChange}
			onIncrement={handleIncreaseNonNative}
			onReduction={handleReduceNonNative}
			onBounceAnimationEnd={onBounceAnimationEnd}
		/>
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
});
