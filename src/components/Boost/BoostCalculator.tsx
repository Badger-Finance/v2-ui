import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { BoostCalculatorContainer } from './BoostCalculatorContent';
import { StoreContext } from '../../mobx/store-context';
import { useConnectWallet } from '../../mobx/utils/hooks';
import { formatWithoutExtraZeros } from './utils';
import { BoostLeaderBoardRank } from './BoostLeaderBoardRank';
import { BoostCalculatorHeader } from './BoostCalculatorHeader';

const useStyles = makeStyles((theme) => ({
	calculatorContainer: {
		margin: 'auto',
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		[theme.breakpoints.up('sm')]: {
			height: 453,
		},
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			margin: theme.spacing(1, 0),
		},
		margin: theme.spacing(3, 0),
	},
}));

export const BoostCalculator = observer(
	(): JSX.Element => {
		const {
			wallet: { connectedAddress },
			boostOptimizer,
		} = useContext(StoreContext);

		const { nativeHoldings, nonNativeHoldings } = boostOptimizer;
		const classes = useStyles();
		const connectWallet = useConnectWallet();

		const [boost, setBoost] = useState<string>();
		const [rank, setRank] = useState<string>();
		const [native, setNative] = useState<string>();
		const [nonNative, setNonNative] = useState<string>();
		const [nativeToAdd, setNativeToAdd] = useState<string>();

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
				<Paper className={classes.calculatorContainer}>
					<Button fullWidth size="large" variant="contained" color="primary" onClick={connectWallet}>
						Connect Wallet
					</Button>
				</Paper>
			);
		}

		return (
			<Grid container spacing={2}>
				<Grid item xs={12} md>
					<Grid container component={Paper} className={classes.calculatorContainer}>
						<Grid item>
							<BoostCalculatorHeader
								boost={boost}
								onBoostChange={handleBoostChange}
								onReset={handleReset}
							/>
						</Grid>
						<Divider className={classes.divider} />
						<Grid item xs>
							<BoostCalculatorContainer
								native={native || ''}
								nonNative={nonNative || ''}
								nativeToAdd={nativeToAdd}
								onNativeChange={handleNativeChange}
								onNonNativeChange={handleNonNativeChange}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12} md={3}>
					<BoostLeaderBoardRank rank={rank} />
				</Grid>
			</Grid>
		);
	},
);
