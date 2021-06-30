import BigNumber from 'bignumber.js';

import deploy from '../../config/deployments/mainnet.json';
import { RootStore } from '../store';

export class BoostOptimizerStore {
	constructor(private store: RootStore) {
		this.store = store;
	}

	/**
	 *  Value of BADGER Balance plus value of DIGG Balance represented in USD
	 */
	get nativeHoldings(): BigNumber | undefined {
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

	/**
	 * Value of non-native staked sett positions represented in USD
	 */
	get nonNativeHoldings(): BigNumber | undefined {
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

	/**
	 * Calculates what rank position would a specific boost have in the leaderboard
	 * @param boost target boost
	 */
	calculateRankFromBoost(boost: number): number | undefined {
		const { completeBoard: leaderBoard } = this.store.leaderBoard;

		if (!leaderBoard) return;

		for (let index = 0; index < leaderBoard.length; index++) {
			if (boost >= Number(leaderBoard[index].boost)) {
				return index;
			}
		}

		return leaderBoard.length - 1;
	}

	/**
	 * Calculates what rank position given native and native balances.
	 * This is done by determining first the boost ratio of the balances and then
	 * searching in the leaderboard which is the first slot that holds a bigger ratio.
	 * @param native native's balance
	 * @param nonNative non native's balance
	 */
	calculateRank(native: BigNumber.Value, nonNative: BigNumber.Value): number | undefined {
		const { accountDetails } = this.store.user;
		const { completeBoard: leaderBoard } = this.store.leaderBoard;

		if (!leaderBoard || !accountDetails) {
			return;
		}

		const boostRatio = this.calculateBoostRatio(native, nonNative);

		if (boostRatio === -1) {
			return accountDetails.boostRank;
		}

		return this.findPositionInLeaderboardFromBoostRatio(boostRatio);
	}

	/**
	 * Calculate user boost given native and non native balances.
	 * Boost is determined using the rank the boost ratio would have in the leaderboard and then searching
	 * in the leaderboard the first slot that holds a bigger boost ratio
	 * @param native native's balance
	 * @param nonNative non-native's balance
	 */
	calculateBoost(native: BigNumber.Value, nonNative: BigNumber.Value): number | undefined {
		const { completeBoard: leaderBoard } = this.store.leaderBoard;

		if (!leaderBoard) {
			return;
		}

		const boostRatio = this.calculateBoostRatio(native, nonNative);

		if (boostRatio === -1) {
			return 1;
		}

		const positionInLeaderboard = this.findPositionInLeaderboardFromBoostRatio(boostRatio);

		if (positionInLeaderboard === undefined) {
			return;
		}

		return Number(leaderBoard[positionInLeaderboard].boost);
	}

	/**
	 * Calculate how much USD would be required in native assets to match a desired boost given
	 * a set of native and non-native balances.
	 * @param native native's balance
	 * @param nonNative non-native's balance
	 * @param desiredBoost target boost
	 */
	calculateNativeToMatchBoost(
		native: BigNumber.Value,
		nonNative: BigNumber.Value,
		desiredBoost: number,
	): BigNumber | undefined {
		const { completeBoard: leaderBoard } = this.store.leaderBoard;

		if (!leaderBoard) {
			return;
		}

		const boostRatio = this.calculateBoostRatio(native, nonNative);

		if (boostRatio === -1) {
			return;
		}

		const rankUsingDesiredBoost = this.findPositionInLeaderboardFromBoost(desiredBoost);

		if (rankUsingDesiredBoost === undefined) {
			return;
		}

		const positionToOvertakeRatio = leaderBoard[rankUsingDesiredBoost].stakeRatio;
		const ratioToTargetBoost = BigNumber.max(new BigNumber(positionToOvertakeRatio).minus(boostRatio), 0);

		return ratioToTargetBoost.multipliedBy(nonNative).multipliedBy(1.1);
	}

	/**
	 * Calculates boost ration using the following formula:
	 * [$ value of BADGER Balance + $ value of DIGG Balance] / [$ value of non-native staked sett positions].
	 * The higher the value of your native positions against your non-native positions, the higher your Badger Ratio.
	 * @param native
	 * @param nonNative
	 */
	private calculateBoostRatio = (native: BigNumber.Value, nonNative: BigNumber.Value): number => {
		const boostRatio = new BigNumber(native).dividedBy(nonNative);

		// handle 0/0 and x/0 division
		if (boostRatio.isNaN() || !boostRatio.isFinite()) {
			return -1;
		}

		return boostRatio.toNumber();
	};

	private findPositionInLeaderboardFromBoostRatio = (boostRatio: number): number | undefined => {
		const { completeBoard: leaderBoard } = this.store.leaderBoard;

		if (!leaderBoard) {
			return;
		}

		for (let index = 0; index < leaderBoard.length; index++) {
			if (boostRatio >= Number(leaderBoard[index].stakeRatio)) {
				return index;
			}
		}

		return leaderBoard.length - 1;
	};

	private findPositionInLeaderboardFromBoost = (boost: number): number | undefined => {
		const { completeBoard: leaderBoard } = this.store.leaderBoard;

		if (!leaderBoard) {
			return;
		}

		for (let index = 0; index < leaderBoard.length; index++) {
			if (boost >= Number(leaderBoard[index].boost)) {
				return index;
			}
		}

		return leaderBoard.length - 1;
	};
}
