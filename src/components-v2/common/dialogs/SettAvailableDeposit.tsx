import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { VaultCap } from 'mobx/model/vaults/vault-cap';
import { MAX } from '../../../config/constants';
import BigNumber from 'bignumber.js';

const useStyles = makeStyles((theme) => ({
	limitsContainer: {
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		[theme.breakpoints.down('xs')]: {
			flexDirection: 'column',
			marginBottom: theme.spacing(1),
		},
	},
	depositContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		[theme.breakpoints.down('xs')]: {
			marginBottom: theme.spacing(1),
		},
	},
}));

export interface DepositLimitProps {
	vaultCapInfo: VaultCap;
}

export const SettAvailableDeposit = (props: DepositLimitProps): JSX.Element | null => {
	const displayDecimals = 4;
	const classes = useStyles();
	const { vaultCapInfo } = props;
	if (!vaultCapInfo) {
		return null;
	}
	const { vaultCap, totalVaultCap, userCap, totalUserCap, asset } = vaultCapInfo;
	const displayUserCap = vaultCap.tokenBalance.lte(userCap.tokenBalance) ? vaultCap : userCap;
	const isMaxUserCap = totalUserCap.tokenBalance.toFixed() === new BigNumber(MAX).toFixed();
	const isMaxTotalCap = vaultCap.tokenBalance.toFixed() === new BigNumber(MAX).toFixed();

	if (isMaxTotalCap && isMaxUserCap) {
		return null;
	}

	return (
		<div className={classes.limitsContainer}>
			{!isMaxUserCap && (
				<div className={classes.depositContainer}>
					<Typography align="center" variant="body2" color="textSecondary">
						User Deposit Limit Remaining:{' '}
					</Typography>
					<Typography align="center" variant="body2" color="textSecondary" component="div">
						{`${displayUserCap.balanceDisplay(displayDecimals)} / ${totalUserCap.balanceDisplay(
							displayDecimals,
						)} ${asset}`}
					</Typography>
				</div>
			)}
			{!isMaxTotalCap && (
				<div className={classes.depositContainer}>
					<Typography align="center" variant="body2" color="textSecondary">
						Total Deposit Limit Remaining:{' '}
					</Typography>
					<Typography align="center" variant="body2" color="textSecondary" component="div">
						{`${vaultCap.balanceDisplay(displayDecimals)} / ${totalVaultCap.balanceDisplay(
							displayDecimals,
						)} ${asset}`}
					</Typography>
				</div>
			)}
		</div>
	);
};
