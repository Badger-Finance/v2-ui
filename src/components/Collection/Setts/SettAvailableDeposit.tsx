import React from 'react';
import { Typography } from '@material-ui/core';
import { Account } from 'mobx/model';

export interface DepositLimitProps {
	accountDetails: Account | null | undefined;
	vault: string | null | undefined;
	assetName: string;
}

export const SettAvailableDeposit = (props: DepositLimitProps): JSX.Element => {
	const { accountDetails, vault, assetName } = props;
	if (!accountDetails || !vault || !accountDetails.depositLimits[vault]) return <> </>;
	return (
		<Typography variant="body2" color="textSecondary" component="div">
			{`Deposit Limit Remaining: ${accountDetails.depositLimits[vault].available} / ${accountDetails.depositLimits[vault].limit} ${assetName}`}
		</Typography>
	);
};
