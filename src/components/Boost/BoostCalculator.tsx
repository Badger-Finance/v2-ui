import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, OutlinedInput, Paper, Typography, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { BoostCalculatorContainer } from './BoostCalculatorContent';
import { StoreContext } from '../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';
import { useConnectWallet } from '../../mobx/utils/hooks';
import { formatWithoutExtraZeros, getColorFromComparison } from './utils';
import clsx from 'clsx';
import { useNumericInput } from '../../utils/useNumericInput';

const useBoostStyles = (currentBoost?: string, boost?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (!currentBoost || !boost) {
			return {
				fontColor: {
					color: theme.palette.text.secondary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentBoost,
					toBeComparedValue: boost,
					greaterCaseColor: '#74D189',
					lessCaseColor: theme.palette.error.main,
					defaultColor: theme.palette.text.secondary,
				}),
			},
		};
	});
};

const useRankStyles = (currentRank?: string, rank?: BigNumber.Value) => {
	return makeStyles((theme) => {
		if (!currentRank || !rank) {
			return {
				fontColor: {
					color: theme.palette.text.secondary,
				},
			};
		}

		return {
			fontColor: {
				color: getColorFromComparison({
					toCompareValue: currentRank,
					toBeComparedValue: rank,
					greaterCaseColor: theme.palette.error.main,
					lessCaseColor: '#74D189',
					defaultColor: theme.palette.text.secondary,
				}),
			},
		};
	});
};

const useStyles = makeStyles((theme) => ({
	rootContainer: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		maxWidth: 650,
		flexDirection: 'column',
	},
	header: {
		padding: theme.spacing(2),
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(2),
		},
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(5),
	},
	boostText: {
		fontSize: theme.spacing(4),
	},
	rankContainer: {
		marginTop: 4,
	},
	rankValue: {
		marginLeft: 6,
	},
	invalidBoost: {
		color: theme.palette.error.main,
	},
}));

const BoostInput = withStyles(() => ({
	root: {
		marginLeft: 12,
		maxWidth: 60,
	},
	input: {
		fontSize: 21,
		padding: 8,
		textAlign: 'center',
	},
	notchedOutline: {
		borderWidth: 2,
	},
}))(OutlinedInput);

const isValidBoost = (boost: string) => Number(boost) >= 1 && Number(boost) <= 3;

export const BoostCalculator = observer(
	(): JSX.Element => {
		const {
			wallet: { connectedAddress },
			user: { accountDetails },
			boostOptimizer,
		} = useContext(StoreContext);

		const [boost, setBoost] = useState<string>();
		const [rank, setRank] = useState<string>();
		const [native, setNative] = useState<string>();
		const [nonNative, setNonNative] = useState<string>();
		const [nativeToAdd, setNativeToAdd] = useState<string>();

		const { nativeHoldings, nonNativeHoldings } = boostOptimizer;
		const classes = useStyles();
		const { onValidChange, inputProps } = useNumericInput();
		const connectWallet = useConnectWallet();
		const boostClasses = useBoostStyles(boost, accountDetails?.boost)();
		const rankClasses = useRankStyles(rank, accountDetails?.boostRank)();

		const validBoost = boost !== undefined ? isValidBoost(boost) : true; // evaluate only after loaded

		const updateBoostAndRank = (newNative: string, newNonNative: string) => {
			const newBoostRatio = boostOptimizer.calculateBoostRatio(newNative, newNonNative);
			const newRank = newBoostRatio ? boostOptimizer.calculateLeaderBoardSlot(newBoostRatio) : undefined;

			if (!newBoostRatio || !newRank) {
				return;
			}

			setBoost(newBoostRatio.toFixed(2));
			setRank((newRank + 1).toString()); // +1 because the position is zero index
		};

		const handleReset = () => {
			if (nativeHoldings && nonNativeHoldings) {
				setNative(formatWithoutExtraZeros(nativeHoldings, 3));
				setNonNative(formatWithoutExtraZeros(nonNativeHoldings, 3));
				setNativeToAdd(undefined);
			}
		};

		const handleBoostChange = (updatedBoost: string) => {
			setBoost(updatedBoost);

			if (Number(updatedBoost) > Number(boost)) {
				const toMatchBoost = boostOptimizer.calculateNativeToMatchBoost(Number(updatedBoost));

				if (toMatchBoost && toMatchBoost.gt(0)) {
					setNativeToAdd(toMatchBoost.toFixed(3, BigNumber.ROUND_HALF_FLOOR));
				}
			}
		};

		const handleNativeChange = (change: string) => {
			setNative(change);

			if (nonNative) {
				updateBoostAndRank(change, nonNative);
			}
		};

		const handleNonNativeChange = (change: string) => {
			setNonNative(change);

			if (native) {
				updateBoostAndRank(native, change);
			}
		};

		// load store holdings by default once they're available
		useEffect(() => {
			if (nativeHoldings && native === undefined) {
				setNative(formatWithoutExtraZeros(nativeHoldings, 3));
			}

			if (nonNativeHoldings && nonNative === undefined) {
				setNonNative(formatWithoutExtraZeros(nonNativeHoldings, 3));
			}
		}, [native, nativeHoldings, nonNative, nonNativeHoldings]);

		if (!connectedAddress) {
			return (
				<Paper className={classes.rootContainer}>
					<Button fullWidth size="large" variant="contained" color="primary" onClick={connectWallet}>
						Connect Wallet
					</Button>
				</Paper>
			);
		}

		return (
			<Paper className={classes.rootContainer}>
				<Grid container direction="column" justify="center" spacing={3} className={classes.header}>
					<Grid container justify="center" alignItems="center">
						<Typography className={classes.boostText}>Boost: </Typography>
						<BoostInput
							className={validBoost ? boostClasses.fontColor : classes.invalidBoost}
							disabled={!accountDetails}
							error={!validBoost}
							inputProps={inputProps}
							placeholder="1.00"
							onChange={onValidChange(handleBoostChange)}
							value={boost || ''}
						/>
					</Grid>
					<Grid className={classes.rankContainer} container justify="center" alignItems="center">
						<Typography color="textSecondary">Rank: </Typography>
						<Typography
							color="textSecondary"
							className={clsx(classes.rankValue, rank !== undefined && rankClasses.fontColor)}
						>
							{rank || <Skeleton width={35} />}
						</Typography>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<BoostCalculatorContainer
					native={native || ''}
					nonNative={nonNative || ''}
					nativeToAdd={nativeToAdd}
					onNativeChange={handleNativeChange}
					onNonNativeChange={handleNonNativeChange}
					onReset={handleReset}
				/>
			</Paper>
		);
	},
);
