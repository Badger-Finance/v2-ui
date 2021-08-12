import React from 'react';
import { Box, BoxProps, Button, withStyles } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

const ActionButton = withStyles((theme) => ({
	disabled: {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		color: theme.palette.common.white,
	},
}))(Button);

const DepositButton = styled(ActionButton)(({ theme }) => ({
	marginLeft: theme.spacing(1),
}));

interface Props extends BoxProps {
	isWithdrawDisabled?: boolean;
	isDepositDisabled?: boolean;
	onWithdrawClick: () => void;
	onDepositClick: () => void;
}

export const ActionButtons = ({
	isDepositDisabled = false,
	isWithdrawDisabled = false,
	onWithdrawClick,
	onDepositClick,
	...materialProps
}: Props): JSX.Element => {
	return (
		<Box {...materialProps}>
			<ActionButton color="primary" variant="outlined" disabled={isWithdrawDisabled} onClick={onWithdrawClick}>
				Withdraw
			</ActionButton>
			<DepositButton color="primary" variant="contained" disabled={isDepositDisabled} onClick={onDepositClick}>
				Deposit
			</DepositButton>
		</Box>
	);
};
