import React from 'react';
import { Typography } from '@material-ui/core';
import { SettMap } from 'mobx/model';

export interface DepositLimitProps {
	settMap: SettMap | null | undefined;
	vault: string | null | undefined;
	assetName: string;
}

export const SettAvailableDeposit = (props: DepositLimitProps): JSX.Element => {
	const { settMap, vault, assetName } = props;
	if (!settMap || !vault || !settMap[vault]) return <> </>;
	const sett = settMap[vault];
	return sett.affiliate ? (
		<Typography variant="body2" color="textSecondary" component="div">
			{`Deposit Limit Remaining: ${sett.affiliate.availableDepositLimit} / ${sett.affiliate.depositLimit} ${assetName}`}
		</Typography>
	) : (
		<> </>
	);
};
