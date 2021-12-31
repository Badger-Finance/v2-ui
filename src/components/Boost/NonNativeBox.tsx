import React from 'react';
import { observer } from 'mobx-react-lite';
import { Grid, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { HoldingAssetInput } from './HoldingAssetInput';
import { StoreContext } from '../../mobx/store-context';
import { useAssetInputStyles } from './utils';

const useStyles = makeStyles((theme) => ({
	settInformation: {
		width: '100%',
		textAlign: 'center',
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

const useValueIsGreater = (a?: string, b?: string): boolean => {
	if (a === undefined || b === undefined) {
		return false;
	}

	return Number(a) > Number(b);
};

interface Props {
	showMessageBounce: boolean;
	isLoading: boolean;
	nonNativeBalance: string;
	onChange: (change: string) => void;
	onIncrement: () => void;
	onReduction: () => void;
	onBounceAnimationEnd: () => void;
}

export const NonNativeBox = observer((props: Props) => {
	const { user } = React.useContext(StoreContext);
	const nonNativeHoldings = user.accountDetails?.nonNativeBalance;

	const { showMessageBounce, nonNativeBalance, isLoading, onChange, onIncrement, onReduction, onBounceAnimationEnd } =
		props;

	const classes = useStyles();
	const theme = useTheme();
	const extraSmallScreen = useMediaQuery(theme.breakpoints.down(500));
	const nonNativeAssetClasses = useAssetInputStyles(nonNativeBalance, nonNativeHoldings)();

	const showEmptyNonNativeMessage = Number(nonNativeBalance) === 0;
	const showReducedNonNativeMessage = useValueIsGreater(nonNativeHoldings?.toFixed(4), nonNativeBalance);

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
			<Typography variant="h6">Non Native: </Typography>
			<HoldingAssetInput
				className={classes.assetInput}
				disabled={isLoading}
				placeholder="$5,000"
				fullWidth={extraSmallScreen}
				InputProps={{
					className: nonNativeAssetClasses.assetColor,
				}}
				onChange={onChange}
				onIncrement={handleIncrement}
				onReduction={handleReduction}
				value={nonNativeBalance}
				inputProps={{ 'aria-label': 'non native holdings amount' }}
				increaseAlt="increase non native holdings"
				decreaseAlt="decrease non native holdings"
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
});
