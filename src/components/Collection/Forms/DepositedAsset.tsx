import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { StoreContext } from 'mobx/store-context';
import { SettModalProps } from './VaultDeposit';
import { styled } from '@material-ui/core/styles';

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
	display: 'inline-flex',
	width: '25%',
	paddingLeft: theme.spacing(1),
}));

export const DepositedAsset = observer(({ sett, badgerSett }: SettModalProps) => {
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress },
		user: { settBalances },
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const totalAvailable = userBalance.scaledBalanceDisplay();
	const isLoading = !connectedAddress || !totalAvailable;

	return (
		<Typography variant="body1" color={'textSecondary'}>
			Deposited {`b${sett.asset}`}: {isLoading ? <StyledSkeleton animation="wave" /> : totalAvailable}
		</Typography>
	);
});
