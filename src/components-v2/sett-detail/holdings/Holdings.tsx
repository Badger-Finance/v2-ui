import React from 'react';
import { Grid } from '@material-ui/core';
import BigNumber from 'bignumber.js';
import { HoldingItem } from './HoldingItem';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../../mobx/store-context';
import { SettBalance } from '../../../mobx/model/setts/sett-balance';
import { formatWithoutExtraZeros, numberWithCommas } from '../../../mobx/utils/helpers';
import { Skeleton } from '@material-ui/lab';
import { Sett } from '../../../mobx/model/setts/sett';

interface Props {
	sett: Sett;
	settBalance: SettBalance;
}

const displayUsdBalance = (value: BigNumber.Value) => `~${numberWithCommas(formatWithoutExtraZeros(value, 4))}$`;

export const Holdings = observer(
	({ settBalance, sett }: Props): JSX.Element => {
		const { prices, setts } = React.useContext(StoreContext);

		const { id, depositedBalance, earnedBalance, balance, withdrawnBalance } = settBalance;
		const usdExchangeRate = prices.exchangeRates?.usd;
		const settPrice = prices.getPrice(id);
		const principle = depositedBalance - withdrawnBalance;
		const logo = `/assets/icons/${settBalance.asset.toLowerCase()}.png`;

		const depositToken = setts.getToken(sett.underlyingToken);
		const decimals = depositToken?.decimals || 18;

		let depositedUsd;
		let principleUsd;
		let earnedUsd;

		if (usdExchangeRate && !settPrice.isZero()) {
			depositedUsd = displayUsdBalance(settPrice.multipliedBy(balance).multipliedBy(usdExchangeRate));
			earnedUsd = displayUsdBalance(settPrice.multipliedBy(earnedBalance).multipliedBy(usdExchangeRate));
			principleUsd = displayUsdBalance(settPrice.multipliedBy(principle).multipliedBy(usdExchangeRate));
		}

		return (
			<Grid container spacing={1}>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Your Total"
						logo={logo}
						amount={formatWithoutExtraZeros(balance, decimals)}
						dollarAmount={depositedUsd ?? <Skeleton width={30} />}
					/>
				</Grid>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Principle"
						logo={logo}
						amount={formatWithoutExtraZeros(principle, decimals)}
						dollarAmount={principleUsd ?? <Skeleton width={30} />}
					/>
				</Grid>
				<Grid item xs={12} sm>
					<HoldingItem
						name="Earned"
						logo={logo}
						amount={formatWithoutExtraZeros(earnedBalance, decimals)}
						dollarAmount={earnedUsd ?? <Skeleton width={30} />}
					/>
				</Grid>
			</Grid>
		);
	},
);
