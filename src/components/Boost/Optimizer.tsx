import { Divider, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';

import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import { StoreContext } from '../../mobx/store-context';
import { calculateNativeToMatchRank } from '../../utils/boost-ranks';
import { OptimizerBody } from './OptimizerBody';
import OptimizerHeader from './OptimizerHeader';
import { StakeInformation } from './StakeInformation';

const useStyles = makeStyles((theme) => ({
	calculatorContainer: {
		padding: theme.spacing(3),
		alignSelf: 'stretch',
	},
	divider: {
		width: '100%',
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

export const Optimizer = observer((): JSX.Element => {
	const {
		user: { accountDetails },
		wallet,
	} = useContext(StoreContext);

	const classes = useStyles();
	const [stakeRatio, setStakeRatio] = useState(0);
	const [native, setNative] = useState('0');
	const [nonNative, setNonNative] = useState('0');
	const [nativeToAdd, setNativeToAdd] = useState<string>();
	const [showBouncingMessage, setShowBouncingMessage] = useState(false);

	const resetToDisconnectedWalletDefaults = () => {
		setNative('0');
		setNonNative('0');
		setNativeToAdd(undefined);
		setStakeRatio(0);
		return;
	};

	const updateCalculation = (newNative: string, newNonNative: string) => {
		const numberNewNative = Number(newNative);
		const numericNewNonNative = Number(newNonNative);

		if (isNaN(numberNewNative) || isNaN(numericNewNonNative) || numericNewNonNative === 0) {
			setStakeRatio(0);
			return;
		}

		const stakeRatio = numberNewNative / numericNewNonNative;
		setStakeRatio(stakeRatio);
	};

	const handleReset = () => {
		if (!accountDetails) {
			resetToDisconnectedWalletDefaults();
			return;
		}

		const { nativeBalance, nonNativeBalance } = accountDetails;
		const stakeRatio = nativeBalance / nonNativeBalance;

		setNativeToAdd(undefined);
		setNative(nativeBalance.toFixed(4));
		setNonNative(nonNativeBalance.toFixed(4));
		setStakeRatio(stakeRatio);
	};

	const handleRankClick = (targetRank: BoostRank) => {
		if (!nonNative || Number(nonNative) === 0) {
			setShowBouncingMessage(true);
			return;
		}

		const numericNative = Number(native);
		const numericNonNative = Number(nonNative);

		if (isNaN(numericNative) || isNaN(numericNonNative)) {
			return;
		}

		setNativeToAdd(calculateNativeToMatchRank(numericNative, numericNonNative, targetRank).toString());
	};

	const handleNativeChange = (change: string) => {
		setNative(change);
		setNativeToAdd(undefined);

		if (nonNative) {
			updateCalculation(change, nonNative);
		}
	};

	const handleNonNativeChange = (change: string) => {
		setNonNative(change);
		setNativeToAdd(undefined);

		if (native) {
			updateCalculation(native, change);
		}
	};

	// load store holdings by default once they're available
	useEffect(() => {
		// wallet was disconnected so we reset values to no wallet defaults
		if (!wallet.isConnected) {
			resetToDisconnectedWalletDefaults();
			return;
		}

		if (!accountDetails) return;

		const { nativeBalance, nonNativeBalance } = accountDetails;
		const stakeRatio = nativeBalance / nonNativeBalance;

		setNative(nativeBalance.toFixed(4));
		setNonNative(nonNativeBalance.toFixed(4));
		setStakeRatio(stakeRatio);
	}, [accountDetails, wallet, wallet.address]);

	return (
		<Grid container spacing={2}>
			<Grid container item xs={12} lg>
				<Grid container direction="column" component={Paper} className={classes.calculatorContainer}>
					<Grid item>
						<OptimizerHeader stakeRatio={stakeRatio} onReset={handleReset} />
					</Grid>
					<Divider className={classes.divider} />
					<Grid item>
						<OptimizerBody
							stakeRatio={stakeRatio}
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
});
