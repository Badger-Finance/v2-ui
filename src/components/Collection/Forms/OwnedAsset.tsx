import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { StoreContext } from 'mobx/store-context';
import { SettModalProps } from './VaultDeposit';
import { styled } from '@material-ui/core/styles';

interface Props extends SettModalProps {
	prefix: string;
}

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
	display: 'inline-flex',
	width: '25%',
	paddingLeft: theme.spacing(1),
}));

export const OwnedAsset = observer(({ prefix, sett, badgerSett }: Props) => {
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress },
		user: { settBalances },
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const isLoading = !connectedAddress || !userBalance;

	return (
		<Typography variant="body1" color={'textSecondary'}>
			{`${prefix} b${sett.asset}`}:{' '}
			{isLoading ? <StyledSkeleton animation="wave" /> : userBalance.scaledBalanceDisplay()}
		</Typography>
	);
});
