import BigNumber from 'bignumber.js';

import deploy from '../../config/deployments/mainnet.json';
import { RootStore } from '../store';
import { LeaderBoardEntry } from '../model';
import { extendObservable } from 'mobx';
import { fetchCompleteLeaderBoardData } from '../utils/apiV2';

// linear interpolation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class BoostOptimizerStore {
	leaderBoard: LeaderBoardEntry[] | null = null;

	constructor(private store: RootStore) {
		this.store = store;

		extendObservable(this, {
			leaderBoard: this.leaderBoard,
		});

		this.loadLeaderBoard().then();
	}

	async loadLeaderBoard(): Promise<void> {
		this.leaderBoard = await fetchCompleteLeaderBoardData();
	}

	get nativeHoldings(): BigNumber | undefined {
		if (!this.store.user.accountDetails || !this.store.prices.exchangeRates) return;

		let holdings = new BigNumber(0);
		const userAccountDetails = this.store.user.accountDetails.multipliers;
		const settTokens = Object.keys(userAccountDetails);

		for (const settToken of settTokens) {
			const settPrice = this.store.prices.getPrice(settToken);
			const settBalance = this.store.user.settBalances[settToken]?.balance;

			if (settPrice && settBalance) {
				holdings = holdings.plus(settBalance.multipliedBy(settPrice));
			}
		}

		return holdings.multipliedBy(this.store.prices.exchangeRates.usd);
	}

	get nonNativeHoldings(): BigNumber | undefined {
		const { exchangeRates } = this.store.prices;
		const badgerBalance = this.store.user.tokenBalances[deploy.tokens.badger];
		const diggBalance = this.store.user.tokenBalances[deploy.tokens.digg];

		if (!badgerBalance || !diggBalance || !exchangeRates) return;

		const badgerPrice = this.store.prices.getPrice(deploy.tokens.badger);
		const badgerHoldings = badgerBalance.balance.multipliedBy(badgerPrice);
		const diggPrice = this.store.prices.getPrice(deploy.tokens.digg);
		const diggBalanceHoldings = diggBalance.balance.multipliedBy(diggPrice);

		return badgerHoldings.plus(diggBalanceHoldings).multipliedBy(exchangeRates.usd);
	}

	calculateLeaderBoardSlot(boost: number): number | undefined {
		if (!this.leaderBoard) return;

		for (let index = 0; index < this.leaderBoard.length; index++) {
			if (boost > Number(this.leaderBoard[index].boost)) {
				return index;
			}
		}

		return this.leaderBoard.length - 1;
	}

	calculateBoostRatio(native: string, nonNative: string): number | undefined {
		if (!this.leaderBoard) return;

		const boostRatio = new BigNumber(native).dividedBy(nonNative);

		// handle 0/0 and x/0 division
		if (boostRatio.isNaN() || !boostRatio.isFinite()) {
			return 1;
		}

		const leaderboardSlot = this.calculateLeaderBoardSlot(boostRatio.toNumber());

		if (!leaderboardSlot) {
			return;
		}

		const leaderboardRankLerp = 1 - leaderboardSlot / this.leaderBoard.length;
		return Math.min(lerp(1, 3, leaderboardRankLerp), 3);
	}

	calculateNativeToMatchBoost(desiredBoost: number): BigNumber | undefined {
		if (!this.nonNativeHoldings || !this.leaderBoard) return;

		if (this.nonNativeHoldings.eq(0)) {
			return new BigNumber(0);
		}

		let positionToOvertake = this.leaderBoard.length - 1;
		const invertedLeaderBoard = this.leaderBoard.sort((a, b) => Number(a.boost) - Number(b.boost));

		for (let index = 0; index < invertedLeaderBoard.length; index++) {
			if (Number(invertedLeaderBoard[index].boost) >= desiredBoost) {
				positionToOvertake = index;
				break;
			}
		}

		const amountToGetToPosition = Number(invertedLeaderBoard[positionToOvertake].boost) - desiredBoost;
		return this.nonNativeHoldings.multipliedBy(amountToGetToPosition);
	}
}
