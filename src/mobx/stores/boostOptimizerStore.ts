import BigNumber from 'bignumber.js';

import { RootStore } from '../RootStore';
import { percentageBetweenRange } from '../../utils/componentHelpers';
import { ZERO } from '../../config/constants';
import { LeaderBoardEntry } from '../model/boost/leaderboard-entry';

// linear interpolation
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class BoostOptimizerStore {
	constructor(private store: RootStore) {
		this.store = store;
	}

	/**
	 * Calculates what rank position would a specific boost have in the leaderboard.
	 * Returns first entry whose boost value is less or equal to the given boost.
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
	 * Calculate account boost given native and non native balances.
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
	 *
	 * This is done by calculating the differences between the boost ratio generated from the given
	 * native and non native values and the boost ratio calculated using the desired boost.
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
		const boostRatio = this.calculateBoostRatio(native, nonNative);
		const rankUsingDesiredBoost = this.findPositionInLeaderboardFromBoost(desiredBoost);

		if (!leaderBoard || boostRatio === -1 || rankUsingDesiredBoost === undefined) {
			return;
		}

		const rankPositionToOvertake = leaderBoard[rankUsingDesiredBoost];
		const superiorRank = leaderBoard[rankUsingDesiredBoost - 1];
		const inferiorEntry = leaderBoard[rankUsingDesiredBoost];

		// if current boost ratio is greater or equal to the desired boost ratio there's no need for extra money
		if (boostRatio >= Number(rankPositionToOvertake.stakeRatio)) {
			return ZERO;
		}

		// if we don't have a superior entry that means we've reached the top of the rank and we can calculate
		// the amount missing with the difference in the ratios
		if (!superiorRank) {
			const rankPositionToOvertakeRatio = Number(rankPositionToOvertake.stakeRatio);
			return this.differenceInRatios(boostRatio, rankPositionToOvertakeRatio).multipliedBy(nonNative);
		}

		// interpolate the ratio using the superior and inferior leaderboard entries
		return this.interpolateDifferenceInRatios(desiredBoost, superiorRank, inferiorEntry).multipliedBy(nonNative);
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

	/**
	 * Calculate the difference between two given boost ratios. If difference is negative then zero is returned
	 */
	private differenceInRatios = (ratioA: number, ratioB: number): BigNumber => {
		return BigNumber.max(new BigNumber(ratioB).minus(ratioA), 0);
	};

	/**
	 * Calculate the difference in ratios indirectly by using a desired boost.
	 *
	 * This is done using a linear interpolation using the given superior and inferior entries as range data points
	 * and the desired boost as the middle point
	 * @param desiredBoost
	 * @param slotSuperior
	 * @param slotInferior
	 */
	private interpolateDifferenceInRatios = (
		desiredBoost: number,
		slotSuperior: LeaderBoardEntry,
		slotInferior: LeaderBoardEntry,
	): BigNumber => {
		const userBoostSuperior = Number(slotSuperior.boost);
		const userBoostInferior = Number(slotInferior.boost);
		const stakeRatioFromBoost = percentageBetweenRange(desiredBoost, userBoostSuperior, userBoostInferior) / 100;

		const userStakeRatioSuperior = Number(slotSuperior.stakeRatio);
		const userStakeRatioInferior = Number(slotInferior.stakeRatio);

		return new BigNumber(lerp(userStakeRatioInferior, userStakeRatioSuperior, stakeRatioFromBoost));
	};
}
