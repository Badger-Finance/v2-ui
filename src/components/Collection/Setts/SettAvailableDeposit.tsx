import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { VaultCap } from 'mobx/model/vault-cap';

const useStyles = makeStyles((theme) => ({
	limitsContainer: {
		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: theme.spacing(2),
	},
	depositContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
}));

export interface DepositLimitProps {
	vaultCapInfo: VaultCap;
}

export const SettAvailableDeposit = (props: DepositLimitProps): JSX.Element => {
	const { vaultCapInfo } = props;
	const { vaultCap, totalVaultCap, userCap, totalUserCap, asset } = vaultCapInfo;
	const displayDecimals = 4;
	const classes = useStyles();
	return (
		<div className={classes.limitsContainer}>
			<div className={classes.depositContainer}>
				<Typography variant="body2" color="textSecondary">
					User Deposit Limit Remaining:{' '}
				</Typography>
				<Typography variant="body2" color="textSecondary" component="div">
					{`${userCap.balanceDisplay(displayDecimals)} / ${totalUserCap.balanceDisplay(
						displayDecimals,
					)} ${asset}`}
				</Typography>
			</div>
			<div className={classes.depositContainer}>
				<Typography variant="body2" color="textSecondary">
					Total Deposit Limit Remaining:{' '}
				</Typography>
				<Typography variant="body2" color="textSecondary" component="div">
					{`${vaultCap.balanceDisplay(displayDecimals)} / ${totalVaultCap.balanceDisplay(
						displayDecimals,
					)} ${asset}`}
				</Typography>
			</div>
		</div>
	);
};
