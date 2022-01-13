import React from 'react';
import { Box, BoxProps, Button, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	container: {
		marginTop: theme.spacing(-1),
	},
	button: {
		marginTop: theme.spacing(1),
		width: 121,
	},
	withdraw: {
		marginRight: theme.spacing(1),
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

interface Props extends BoxProps {
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
	...materialProps
}: Props): JSX.Element => {
	const classes = useStyles();

	return (
		<Box {...materialProps} className={clsx(classes.container, materialProps.className)}>
			<VaultActionButton
				className={clsx(classes.button, classes.withdraw, !isWithdrawDisabled && classes.withdrawActive)}
				color="primary"
				variant="contained"
				disabled={isWithdrawDisabled}
				onClick={onWithdrawClick}
			>
				Withdraw
			</VaultActionButton>
			<VaultActionButton
				className={classes.button}
				color="primary"
				variant={isDepositDisabled ? 'outlined' : 'contained'}
				disabled={isDepositDisabled}
				onClick={onDepositClick}
			>
				Deposit
			</VaultActionButton>
		</Box>
	);
};
