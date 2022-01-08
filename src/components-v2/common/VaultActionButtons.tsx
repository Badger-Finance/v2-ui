import React from 'react';
import { Button, Grid, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	button: {
		width: 121,
	},
	withdrawActive: {
		backgroundColor: '#181818',
		color: theme.palette.primary.main,
		'&:hover': {
			backgroundColor: 'rgba(242, 188, 27, 0.08)',
		},
	},
}));

export const VaultActionButton = withStyles((theme) => ({
	disabled: { backgroundColor: 'rgba(255, 255, 255, 0.3)', color: theme.palette.common.white },
}))(Button);

interface Props {
	isWithdrawDisabled?: boolean;
	isDepositDisabled?: boolean;
	onWithdrawClick: () => void;
	onDepositClick: () => void;
}

export const VaultActionButtons = ({
	isDepositDisabled = false,
	isWithdrawDisabled = false,
	onWithdrawClick,
	onDepositClick,
}: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Grid container spacing={2} justifyContent="center">
			<Grid item>
				<VaultActionButton
					className={classes.button}
					color="primary"
					variant={isDepositDisabled ? 'outlined' : 'contained'}
					disabled={isDepositDisabled}
					onClick={onDepositClick}
				>
					Deposit
				</VaultActionButton>
			</Grid>
			<Grid item>
				<VaultActionButton
					className={clsx(classes.button, !isWithdrawDisabled && classes.withdrawActive)}
					color="primary"
					variant="contained"
					disabled={isWithdrawDisabled}
					onClick={onWithdrawClick}
				>
					Withdraw
				</VaultActionButton>
			</Grid>
		</Grid>
	);
};
