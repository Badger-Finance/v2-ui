import React from 'react';
import { Grid } from '@material-ui/core';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { Skeleton } from '@material-ui/lab';
import BigNumber from 'bignumber.js';

interface Props {
	settBalance: SettBalance;
}

const displayUsdBalance = (value: BigNumber.Value) => `~${numberWithCommas(formatWithoutExtraZeros(value, 4))}$`;

export const Holdings = observer(
	({ settBalance }: Props): JSX.Element => {
		const { prices } = React.useContext(StoreContext);

		const { id, depositedBalance, earnedBalance } = settBalance;
		const usdExchangeRate = prices.exchangeRates?.usd;
		const settPrice = prices.getPrice(id);
		const principle = depositedBalance - earnedBalance;
		const logo = `/assets/icons/${settBalance.asset.toLowerCase()}.png`;

		let depositedUsd;
		let principleUsd;
		let earnedUsd;

		if (usdExchangeRate && !settPrice.isZero()) {
			depositedUsd = displayUsdBalance(settPrice.multipliedBy(depositedBalance).multipliedBy(usdExchangeRate));
			earnedUsd = displayUsdBalance(settPrice.multipliedBy(earnedBalance).multipliedBy(usdExchangeRate));
			principleUsd = displayUsdBalance(settPrice.multipliedBy(principle).multipliedBy(usdExchangeRate));
		}

		return (
			<Grid container spacing={1}>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Your Total"
						logo={logo}
						amount={formatWithoutExtraZeros(depositedBalance, 6)}
						dollarAmount={depositedUsd ?? <Skeleton width={30} />}
					/>
				</Grid>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Principle"
						logo={logo}
						amount={formatWithoutExtraZeros(principle, 6)}
						dollarAmount={principleUsd ?? <Skeleton width={30} />}
					/>
				</Grid>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Earned"
						logo={logo}
						amount={formatWithoutExtraZeros(earnedBalance, 6)}
						dollarAmount={earnedUsd ?? <Skeleton width={30} />}
					/>
				</Grid>
			</Grid>
		);
	},
);
