import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { styled } from '@material-ui/core/styles';

import { SettModalProps } from './VaultDeposit';
import { StoreContext } from 'mobx/store-context';
import { TokenBalance } from 'mobx/model/token-balance';

const StyledSkeleton = styled(Skeleton)(({ theme }) => ({
	display: 'inline-flex',
	width: '25%',
	paddingLeft: theme.spacing(1),
}));

export const UnderlyingAsset = observer(({ sett, badgerSett }: SettModalProps) => {
	const store = useContext(StoreContext);

	const {
		wallet: { connectedAddress },
		user: { settBalances },
		setts: { settMap },
		rewards,
	} = store;

	const userBalance = settBalances[badgerSett.vaultToken.address];
	const settPpfs = settMap ? settMap[badgerSett.vaultToken.address].ppfs : 1;
	const underlying = userBalance.tokenBalance.multipliedBy(settPpfs);
	const underlyingBalance = new TokenBalance(rewards, userBalance.token, underlying, userBalance.price);

	return (
		<Typography variant="body2" color={'textSecondary'}>
			Underlying {sett.asset}:{' '}
			{connectedAddress ? underlyingBalance.balanceDisplay() : <StyledSkeleton animation="wave" />}
		</Typography>
	);
});
