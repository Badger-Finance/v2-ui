import React from 'react';
import { Typography } from '@material-ui/core';
import { Account, Sett } from 'mobx/model';

export interface DepositLimitProps {
	accountDetails: Account | null | undefined;
	vault: string | null | undefined;
	assetName: string;
	sett: Sett | null | undefined;
}

export const SettAvailableDeposit = (props: DepositLimitProps): JSX.Element => {
	const { accountDetails, vault, assetName, sett } = props;
	if (!accountDetails || !vault || !accountDetails.depositLimits[vault]) return <> </>;
	return (
		<div>
			<Typography variant="body2" color="textSecondary" component="div">
				{`Personal Deposit Limit Remaining: ${
					accountDetails.depositLimits[vault].available > 1e-8
						? accountDetails.depositLimits[vault].available
						: 0
				} / ${accountDetails.depositLimits[vault].limit} ${assetName}`}
			</Typography>
			<Typography variant="body2" color="textSecondary" component="div">
				{`Total Deposit Limit Remaining: ${sett?.affiliate?.availableDepositLimit} / ${sett?.affiliate?.depositLimit} ${assetName}`}
			</Typography>
		</div>
	);
};
