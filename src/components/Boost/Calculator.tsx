import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { BoostCalculatorContainer } from './CalculatorContent';
import { StoreContext } from '../../mobx/store-context';
import { useConnectWallet } from '../../mobx/utils/hooks';
import { LeaderBoardRank } from './LeaderBoardRank';
import { CalculatorHeader } from './CalculatorHeader';
import { debounce } from '../../utils/componentHelpers';
import { formatWithoutExtraZeros } from '../../mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
	calculatorContainer: {
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		[theme.breakpoints.up('md')]: {
			height: 470,
		},
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			margin: theme.spacing(3, 0, 0, 1),
		},
		margin: theme.spacing(3, 0),
	},
	placeholderContainer: {
		width: '50%',
		margin: 'auto',
		padding: theme.spacing(3),
		textAlign: 'center',
		[theme.breakpoints.down('xs')]: {
			width: '100%',
		},
	},
	placeholderText: {
		marginBottom: theme.spacing(2),
	},
}));

export const Calculator = observer(
	(): JSX.Element => {
		const {
			user: { accountDetails },
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

		const calculateNewBoost = useCallback(
			(targetBoost: number) => {
				if (!native || !nonNative || !accountDetails) return;

				if (targetBoost > accountDetails.boost) {
					const toMatchBoost = boostOptimizer.calculateNativeToMatchBoost(
						native,
						nonNative,
						Number(targetBoost),
					);

					if (toMatchBoost && toMatchBoost.gt(0)) {
						setNativeToAdd(toMatchBoost.toFixed(3, BigNumber.ROUND_HALF_CEIL));
					}
				}
			},
			[native, nonNative, accountDetails, boostOptimizer],
		);

		// reason: the plugin does not recognize the dependency inside the debounce function
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const debounceBoostChange = useCallback(
			debounce(
				600,
				async (updatedBoost: number): Promise<void> => {
					calculateNewBoost(updatedBoost);
				},
			),
			[calculateNewBoost],
		);

		const updateBoostAndRank = (newNative: string, newNonNative: string) => {
			const newBoostRatio = boostOptimizer.calculateBoost(newNative, newNonNative);
			const newRank = boostOptimizer.calculateRank(newNative, newNonNative);

			if (!newBoostRatio || !newRank) {
				return;
			}

			setBoost(newBoostRatio.toFixed(2));
			setRank(newRank.toString()); // +1 because the position is zero index
		};

		const handleReset = () => {
			if (nativeHoldings && nonNativeHoldings && accountDetails) {
				setNative(formatWithoutExtraZeros(nativeHoldings, 3));
				setNonNative(formatWithoutExtraZeros(nonNativeHoldings, 3));
				setNativeToAdd(undefined);
				setBoost(accountDetails.boost.toFixed(2));
				setRank(accountDetails.boostRank.toString());
			}
		};

		const handleRankJump = (rankBoost: number) => {
			if (!native || !nonNative || Number(nonNative) === 0) return;

			const newRank = boostOptimizer.calculateRankFromBoost(rankBoost);

			if (newRank) {
				setRank(String(newRank));
			}

			setBoost(rankBoost.toFixed(2));
			calculateNewBoost(rankBoost);
		};

		const handleBoostChange = (updatedBoost: string) => {
			setBoost(updatedBoost);
			debounceBoostChange(Number(updatedBoost));
		};

		const handleNativeChange = (change: string) => {
			setNative(change);
			setNativeToAdd(undefined);

			if (nonNative) {
				updateBoostAndRank(change, nonNative);
			}
		};

		const handleNonNativeChange = (change: string) => {
			setNonNative(change);
			setNativeToAdd(undefined);

			if (native) {
				updateBoostAndRank(native, change);
			}
		};

		// load store holdings by default once they're available
		useEffect(() => {
			if (accountDetails && boost === undefined) {
				setBoost(accountDetails.boost.toFixed(2));
			}

			if (accountDetails && rank === undefined) {
				setRank(String(accountDetails.boostRank));
			}

			if (nativeHoldings && native === undefined) {
				setNative(formatWithoutExtraZeros(nativeHoldings, 3));
			}

			if (nonNativeHoldings && nonNative === undefined) {
				setNonNative(formatWithoutExtraZeros(nonNativeHoldings, 3));
			}
		}, [boost, rank, native, nonNative, accountDetails, nativeHoldings, nonNativeHoldings]);

		if (!connectedAddress) {
			return (
				<Paper className={classes.placeholderContainer}>
					<Typography className={classes.placeholderText}>
						In order to use the boost optimizer you need to connect your wallet
					</Typography>
					<Button fullWidth size="large" variant="contained" color="primary" onClick={connectWallet}>
						Connect Wallet
					</Button>
				</Paper>
			);
		}

		return (
			<Grid container spacing={2}>
				<Grid item xs={12} lg>
					<Grid container component={Paper} className={classes.calculatorContainer}>
						<Grid item>
							<CalculatorHeader
								accountBoost={accountDetails?.boost}
								boost={boost}
								disableBoost={!nonNative || Number(nonNative) === 0}
								onBoostChange={handleBoostChange}
								onReset={handleReset}
							/>
						</Grid>
						<Divider className={classes.divider} />
						<Grid item container xs direction="column" justify="center">
							<BoostCalculatorContainer
								boost={boost || '1'}
								native={native || ''}
								nonNative={nonNative || ''}
								nativeToAdd={nativeToAdd}
								onNativeChange={handleNativeChange}
								onNonNativeChange={handleNonNativeChange}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12} lg={3}>
					<LeaderBoardRank rank={rank} boost={boost} onRankJump={handleRankJump} />
				</Grid>
			</Grid>
		);
	},
);
