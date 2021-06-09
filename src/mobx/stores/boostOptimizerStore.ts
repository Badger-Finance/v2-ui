import BigNumber from 'bignumber.js';

import deploy from '../../config/deployments/mainnet.json';
import { RootStore } from '../store';
import { exchangeRates } from '../utils/helpers';

export class BoostOptimizerStore {
	constructor(private store: RootStore) {
		this.store = store;
	}

	get nativeHoldings(): BigNumber | undefined {
		if (!this.store.user.accountDetails) return;

		let holdings = new BigNumber(0);
		const userAccountDetails = this.store.user.accountDetails.multipliers;
		const settTokens = Object.keys(userAccountDetails);

		for (const settToken of settTokens) {
			const settPrice = this.store.setts.getPrice(settToken);
			const settBalance = this.store.user.settBalances[settToken]?.balance;

			if (settPrice && settBalance) {
				holdings = holdings.plus(settBalance.multipliedBy(settPrice));
			}
		}

		return holdings.multipliedBy(exchangeRates.usd);
	}

	get nonNativeHoldings(): BigNumber | undefined {
		const badgerBalance = this.store.user.tokenBalances[deploy.tokens.badger];
		const diggBalance = this.store.user.tokenBalances[deploy.tokens.digg];

		if (!badgerBalance || !diggBalance) return;

		const badgerPrice = this.store.setts.getPrice(deploy.tokens.badger);
		const badgerHoldings = badgerBalance.balance.multipliedBy(badgerPrice);
		const diggPrice = this.store.setts.getPrice(deploy.tokens.digg);
		const diggBalanceHoldings = diggBalance.balance.multipliedBy(diggPrice);

		return badgerHoldings.plus(diggBalanceHoldings).multipliedBy(exchangeRates.usd);
	}
}
