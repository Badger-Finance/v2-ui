import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import BigNumber from 'bignumber.js';
import { Button, Divider, Grid, Paper, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { BoostCalculatorContainer } from './BoostCalculatorContent';
import { StoreContext } from '../../mobx/store-context';
import { Skeleton } from '@material-ui/lab';
import { useConnectWallet } from '../../mobx/utils/hooks';

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
		marginBottom: theme.spacing(2),
		textAlign: 'center',
	},
	divider: {
		[theme.breakpoints.down('sm')]: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(2),
		},
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(5),
	},
	boostText: {
		fontSize: theme.spacing(4),
	},
	boostValueBorder: {
		display: 'inline-block',
		boxSizing: 'border-box',
		padding: theme.spacing(1),
		border: '1px solid #5B5B5A',
		borderRadius: 8,
		textAlign: 'center',
	},
	boostValue: {
		marginLeft: 12,
	},
	rankValue: {
		marginLeft: 6,
	},
}));

export const BoostCalculator = observer(
	(): JSX.Element => {
		const {
			wallet: { connectedAddress },
			user: { accountDetails },
			boostOptimizer: { nativeHoldings, nonNativeHoldings },
		} = useContext(StoreContext);
		const classes = useStyles();
		const connectWallet = useConnectWallet();
		const [boost, setBoost] = useState<number>();
		const [rank, setRank] = useState<number>();
		const [native, setNative] = useState<string>();
		const [nonNative, setNonNative] = useState<string>();

		// load store values as defaults
		useEffect(() => {
			if (accountDetails && (boost === undefined || rank === undefined)) {
				setBoost(accountDetails.boost);
				setRank(accountDetails.boostRank);
			}
		}, [boost, rank, accountDetails]);

		useEffect(() => {
			if (nativeHoldings && native === undefined) {
				setNative(nativeHoldings.toFixed(3, BigNumber.ROUND_HALF_FLOOR));
			}
		}, [native, nativeHoldings]);

		useEffect(() => {
			if (nonNativeHoldings && nonNative === undefined) {
				setNonNative(nonNativeHoldings.toFixed(3, BigNumber.ROUND_HALF_FLOOR));
			}
		}, [nonNative, nonNativeHoldings]);

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
				<Grid item container justify="center" spacing={3} className={classes.header}>
					<Grid item container justify="center" alignItems="center" xs={12}>
						<Typography className={classes.boostText}>Boost: </Typography>
						<Typography
							className={clsx(classes.boostValue, boost && classes.boostValueBorder)}
							variant="h5"
						>
							{boost?.toFixed(2) || <Skeleton width={35} />}
						</Typography>
					</Grid>
					<Grid item container justify="center" alignItems="center" xs={12}>
						<Typography color="textSecondary">Rank: </Typography>
						<Typography color="textSecondary" className={classes.rankValue}>
							{rank || <Skeleton width={35} />}
						</Typography>
					</Grid>
				</Grid>
				<Divider className={classes.divider} />
				<BoostCalculatorContainer
					native={native || ''}
					nonNative={nonNative || ''}
					onNativeChange={setNative}
					onNonNativeChange={setNonNative}
				/>
			</Paper>
		);
	},
);
