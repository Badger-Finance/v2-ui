import React from 'react';
import { Button } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

const DepositButton = styled(Button)(({ theme }) => ({
	marginLeft: theme.spacing(1),
}));

export const ActionButtons = (): JSX.Element => {
	return (
		<div>
			<Button color="primary" variant="outlined">
				Withdraw
			</Button>
			<DepositButton color="primary" variant="contained">
				Deposit
			</DepositButton>
		</div>
	);
};
