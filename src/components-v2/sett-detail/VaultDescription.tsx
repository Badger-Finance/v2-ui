import React from 'react';
import { Typography } from '@material-ui/core';

export const VaultDescription = (): JSX.Element => {
	return (
		<Typography variant="body2" color="textSecondary">
			Provide liquidity in Sushiswap WBTC/ETH pool and receive SLP tokens in return, which represent your share of
			the pair. Deposit your SLP tokens in Badger protocol and get bSLP tokens in return. 50% of rewards are
			automatically compounded as the bSLP/LP ratio increases over time. LP tokens are deposted in Sushiswap’s
			Onsen. DIGG and xSushi incentive rewards can be claimed in the dashboard.
		</Typography>
	);
};
