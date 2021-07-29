import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { OptimizerBody } from './OptimizerBody';
import { StoreContext } from '../../mobx/store-context';
import { StakeInformation } from './StakeInformation';
import { OptimizerHeader } from './OptimizerHeader';
import { debounce } from '../../utils/componentHelpers';
import { formatWithoutExtraZeros } from '../../mobx/utils/helpers';
import { calculateMultiplier, calculateNativeToMatchMultiplier, isValidMultiplier } from '../../utils/boost-ranks';
import { MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';

const useStyles = makeStyles((theme) => ({
	calculatorContainer: {
		width: '100%',
		boxSizing: 'border-box',
		padding: theme.spacing(3),
		flexDirection: 'column',
		[theme.breakpoints.up('md')]: {
			height: 503,
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
	stakeInformationCardContainer: {
		[theme.breakpoints.up('lg')]: {
			flexGrow: 0,
			maxWidth: '29%',
			flexBasis: '29%',
		},
	},
}));

export const Optimizer = observer(
	(): JSX.Element => {
		const {
			user: { accountDetails },
			wallet: { connectedAddress },
		} = useContext(StoreContext);

		const classes = useStyles();
		const [multiplier, setMultiplier] = useState<string>();
		const [native, setNative] = useState<string>();
		const [nonNative, setNonNative] = useState<string>();
		const [nativeToAdd, setNativeToAdd] = useState<string>();
		const [showBouncingMessage, setShowBouncingMessage] = useState(false);

		const resetToDisconnectedWalletDefaults = () => {
			setNative('0');
			setNonNative('0');
			setNativeToAdd(undefined);
			setMultiplier(MIN_BOOST_LEVEL.multiplier.toString());
			return;
		};

		const setNativeToMatchMultiplier = useCallback(
			(targetBoost: number) => {
				const numericNative = Number(native);
				const numericNonNative = Number(nonNative);

				if (isNaN(numericNative) || isNaN(numericNonNative)) {
					return;
				}

				const nativeToAdd = calculateNativeToMatchMultiplier(numericNative, numericNonNative, targetBoost);
				setNativeToAdd(nativeToAdd.toString());
			},
			[native, nonNative],
		);

		// reason: the plugin does not recognize the dependency inside the debounce function
		// eslint-disable-next-line react-hooks/exhaustive-deps
		const debounceBoostChange = useCallback(
			debounce(
				600,
				async (updatedBoost: number): Promise<void> => {
					setNativeToMatchMultiplier(updatedBoost);
				},
			),
			[setNativeToMatchMultiplier],
		);

		const updateMultiplier = (newNative: string, newNonNative: string) => {
			const numberNewNative = Number(newNative);
			const numericNewNonNative = Number(newNonNative);

			if (isNaN(numberNewNative) || isNaN(numericNewNonNative) || numericNewNonNative === 0) {
				setMultiplier(MIN_BOOST_LEVEL.multiplier.toString());
				return;
			}

			setMultiplier(calculateMultiplier(numberNewNative, numericNewNonNative).toString());
		};

		const handleReset = () => {
			if (!accountDetails) {
				resetToDisconnectedWalletDefaults();
				return;
			}

			const { nativeBalance, nonNativeBalance } = accountDetails;

			setNativeToAdd(undefined);
			setNative(formatWithoutExtraZeros(nativeBalance, 4));
			setNonNative(formatWithoutExtraZeros(nonNativeBalance, 4));
			setMultiplier(calculateMultiplier(nativeBalance, nonNativeBalance).toString());
		};

		const handleRankClick = (rankBoost: number) => {
			if (!nonNative || Number(nonNative) === 0) {
				setShowBouncingMessage(true);
				return;
			}

			setNativeToMatchMultiplier(rankBoost);
		};

		const handleMultiplierChange = (updatedMultiplier: string) => {
			if (!isValidMultiplier(Number(updatedMultiplier))) {
				setMultiplier(updatedMultiplier);
				setNativeToAdd(undefined);
				return;
			}

			setMultiplier(updatedMultiplier);
			debounceBoostChange(Number(updatedMultiplier));
		};

		const handleNativeChange = (change: string) => {
			setNative(change);
			setNativeToAdd(undefined);

			if (nonNative) {
				updateMultiplier(change, nonNative);
			}
		};

		const handleNonNativeChange = (change: string) => {
			setNonNative(change);
			setNativeToAdd(undefined);

			if (native) {
				updateMultiplier(native, change);
			}
		};

		// load store holdings by default once they're available
		useEffect(() => {
			// wallet was disconnected so we reset values to no wallet defaults
			if (!connectedAddress) {
				resetToDisconnectedWalletDefaults();
				return;
			}

			if (!accountDetails) return;

			const { nativeBalance, nonNativeBalance } = accountDetails;

			setNative(formatWithoutExtraZeros(nativeBalance, 4));
			setNonNative(formatWithoutExtraZeros(nonNativeBalance, 4));
			setMultiplier(calculateMultiplier(nativeBalance, nonNativeBalance).toString());
		}, [accountDetails, connectedAddress]);

		return (
			<Grid container spacing={2}>
				<Grid item xs={12} lg>
					<Grid container component={Paper} className={classes.calculatorContainer}>
						<Grid item>
							<OptimizerHeader
								multiplier={multiplier}
								disableBoost={!nonNative || Number(nonNative) === 0}
								onBoostChange={handleMultiplierChange}
								onReset={handleReset}
								onLockedBoostClick={() => setShowBouncingMessage(true)}
							/>
						</Grid>
						<Divider className={classes.divider} />
						<Grid item container xs direction="column" justify="center">
							<OptimizerBody
								multiplier={multiplier || MIN_BOOST_LEVEL.multiplier.toString()}
								native={native || ''}
								nonNative={nonNative || ''}
								nativeToAdd={nativeToAdd}
								showMessageBounce={showBouncingMessage}
								onNativeChange={handleNativeChange}
								onNonNativeChange={handleNonNativeChange}
								onBounceAnimationEnd={() => setShowBouncingMessage(false)}
							/>
						</Grid>
					</Grid>
				</Grid>
				<Grid item xs={12} className={classes.stakeInformationCardContainer}>
					<StakeInformation native={native} nonNative={nonNative} onRankClick={handleRankClick} />
				</Grid>
			</Grid>
		);
	},
);
