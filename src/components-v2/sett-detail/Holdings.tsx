import React from 'react';
import { Grid } from '@material-ui/core';
import { HoldingItem } from './holdings/HoldingItem';

export const Holdings = (): JSX.Element => {
	return (
		<Grid container spacing={1}>
			<Grid item xs={12} sm>
				<HoldingItem
					name="Your Total"
					logo="/assets/icons/slp-digg-wbtc.png"
					amount="1.21345"
					dollarAmount="~$75,213"
				/>
			</Grid>
			<Grid item xs={12} sm>
				<HoldingItem
					name="Principle"
					logo="/assets/icons/slp-digg-wbtc.png"
					amount="1.01312"
					dollarAmount="~$70,123"
				/>
			</Grid>
			<Grid item xs={12} sm>
				<HoldingItem
					name="Earned"
					logo="/assets/icons/slp-digg-wbtc.png"
					amount="0.21345"
					dollarAmount="~$5,090"
				/>
			</Grid>
		</Grid>
	);
};
