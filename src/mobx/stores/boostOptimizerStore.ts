import BigNumber from 'bignumber.js';

import deploy from '../../config/deployments/mainnet.json';
import { RootStore } from '../store';
import { LeaderBoardEntry } from '../model';
import { extendObservable } from 'mobx';
import { fetchCompleteLeaderBoardData } from '../utils/apiV2';

// linear interpolation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class BoostOptimizerStore {
	leaderBoard?: LeaderBoardEntry[];

	constructor(private store: RootStore) {
		this.store = store;

		extendObservable(this, {
			leaderBoard: this.leaderBoard,
		});

		this.loadLeaderBoard().then();
	}

	async loadLeaderBoard(): Promise<void> {
		const fetchedLeaderBoard = await fetchCompleteLeaderBoardData();

		if (fetchedLeaderBoard) {
			this.leaderBoard = fetchedLeaderBoard;
		}
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

	calculateRankFromBoost(boost: number): number | undefined {
		if (!this.leaderBoard) return;

		for (let index = 0; index < this.leaderBoard.length; index++) {
			if (boost > Number(this.leaderBoard[index].boost)) {
				return index;
			}
		}

		return this.leaderBoard.length - 1;
	}

	calculateRank(native: string, nonNative: string): number | undefined {
		if (!this.leaderBoard || !this.store.user.accountDetails) return;

		const boostRatio = this.calculateBoostRatio(native, nonNative);

		if (boostRatio === -1) {
			return this.store.user.accountDetails.boostRank;
		}

		for (let index = 0; index < this.leaderBoard.length; index++) {
			if (boostRatio > Number(this.leaderBoard[index].stakeRatio)) {
				return index;
			}
		}

		return this.leaderBoard.length - 1;
	}

	calculateBoost(native: string, nonNative: string): number | undefined {
		if (!this.leaderBoard) return;

		const rank = this.calculateRank(native, nonNative);

		if (!rank) {
			return;
		}

		const leaderboardRankLerp = 1 - rank / this.leaderBoard.length;
		return Math.min(lerp(1, 3, leaderboardRankLerp), 3);
	}

	calculateNativeToMatchBoost(native: string, nonNative: string, desiredBoost: number): BigNumber | undefined {
		if (!this.leaderBoard) return;

		const boostRatio = this.calculateBoostRatio(native, nonNative);

		if (boostRatio === -1) {
			return;
		}

		const boostList = this.leaderBoard.map((l) => Number(l.boost));
		const positionToOvertake = this.getSmallestValueGreaterThanLimit(desiredBoost, boostList);

		if (positionToOvertake === -1) {
			return;
		}

		const positionToOvertakeRatio = Number(this.leaderBoard[positionToOvertake].stakeRatio);
		const ratioToTargetBoost = positionToOvertakeRatio - boostRatio;

		const nativeRequired = new BigNumber(nonNative).multipliedBy(ratioToTargetBoost);

		// +10% of overestimation for error margin
		return nativeRequired.multipliedBy(1.1);
	}

	private calculateBoostRatio = (native: string, nonNative: string): number => {
		const boostRatio = new BigNumber(native).dividedBy(nonNative);

		// handle 0/0 and x/0 division
		if (boostRatio.isNaN() || !boostRatio.isFinite()) {
			return -1;
		}

		return boostRatio.toNumber();
	};

	private getSmallestValueGreaterThanLimit = (limit: number, list: number[]): number => {
		let positionToOvertake = -1;

		for (let i = 0; i < list.length; i++) {
			if (list[i] >= limit) {
				if (positionToOvertake == -1)
					// check whether its the first value above the limit in the list
					positionToOvertake = i;
				else if (list[positionToOvertake] > list[i])
					//compare the current value with the previous smallest value
					positionToOvertake = i;
			}
		}

		return positionToOvertake;
	};
}
