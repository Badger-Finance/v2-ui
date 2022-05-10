import { BoostRank } from '../mobx/model/boost/leaderboard-rank';
import { BOOST_RANKS, MAX_BOOST_RANK, MIN_BOOST_RANK } from '../config/system/boost-ranks';
import { restrictToRange } from './componentHelpers';

/**
 * checks that a give multiplier value is within global boost levels multiplier boundaries
 */
export const isValidStakeRatio = (multiplier: number): boolean => {
	return multiplier >= MIN_BOOST_RANK.stakeRatioBoundary && multiplier <= MAX_BOOST_RANK.stakeRatioBoundary;
};

/* Restricts the stake ratio to the minimum and maximum stake ratio boundaries. */
export const clampStakeRatio = (stakeRatio: number): number => {
	return restrictToRange(stakeRatio, MIN_BOOST_RANK.stakeRatioBoundary, MAX_BOOST_RANK.stakeRatioBoundary);
};

/**
 * Given a stake ratio, calculate the amount of native tokens needed to reach a desired boost rank.
 * @param {number} native - The amount of native tokens you currently have
 * @param {number} nonNative - The amount of non-native tokens you currently have.
 * @param {BoostRank} desiredRank - The rank you want to achieve.
 * @returns The amount of non-native currency required to reach the desired rank.
 */
export const calculateNativeToMatchRank = (native: number, nonNative: number, desiredRank: BoostRank): number => {
	const currentStakeRatio = native / nonNative;
	const desiredRankStakeRatio = desiredRank.stakeRatioBoundary;

	if (currentStakeRatio >= desiredRankStakeRatio) {
		return 0;
	}

	// buffer to prevent users from being leveled down due to price changes
	const safeLevelingBuffer = desiredRankStakeRatio - currentStakeRatio / 2;
	return nonNative * (desiredRankStakeRatio - currentStakeRatio) + safeLevelingBuffer;
};

/**
 * Given a stake ratio, return the highest boost rank that has a stake ratio boundary less than or equal to the given
 * stake ratio
 * @returns The highest rank given the stake ratio
 */
export const getHighestRankFromStakeRatio = (stakeRatio: number): BoostRank => {
	return (
		BOOST_RANKS.slice()
			.reverse()
			.find((rank) => rank.stakeRatioBoundary <= stakeRatio) || MIN_BOOST_RANK
	);
};

/**
 * Given a boost rank, return the next boost rank. If there is no next boost rank, it returns undefined
 * @param {BoostRank} currentRank - BoostRank - The current boost rank of the user.
 * @returns The next boost rank.
 */
export const getNextBoostRank = (currentRank: BoostRank): BoostRank | undefined => {
	const currentBoostLevelIndex = BOOST_RANKS.findIndex(
		(rank) => rank.stakeRatioBoundary === currentRank.stakeRatioBoundary,
	);
	return BOOST_RANKS[currentBoostLevelIndex + 1] || MAX_BOOST_RANK;
};

// implementation of the boost rank system: https://github.com/Badger-Finance/badger-rewards/blob/main/rewards/boost/calc_boost.py#L56
export const calculateUserBoost = (stakeRatio: number): number => {
	if (stakeRatio === 0) {
		return 0;
	}

	if (stakeRatio <= 1) {
		return Math.min(Math.floor(stakeRatio * 2000), 2000);
	}

	if (1 < stakeRatio && stakeRatio <= 1.5) {
		return 2000 + Math.floor((stakeRatio - 1) * 1000);
	}

	if (1.5 < stakeRatio && stakeRatio <= 2) {
		return 2500 + Math.floor((stakeRatio - 1.5) * 500);
	}

	return Math.min(2750 + Math.floor((stakeRatio - 2) * 250), 3000);
};
