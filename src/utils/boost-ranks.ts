import { BoostRank, BoostRankLevel } from '../mobx/model/boost/leaderboard-rank';
import { BOOST_LEVELS, BOOST_RANKS } from '../config/system/boost-ranks';
import { clamp } from './componentHelpers';

export const isValidMultiplier = (multiplier: number): boolean => {
	const firstLevelMultiplier = BOOST_LEVELS[0].multiplier;
	const lastLevelMultiplier = BOOST_LEVELS[BOOST_LEVELS.length - 1].multiplier;

	return multiplier >= firstLevelMultiplier && multiplier <= lastLevelMultiplier;
};

export const sanitizeMultiplierValue = (multiplier: number): number => {
	const firstLevelMultiplier = BOOST_LEVELS[0].multiplier;
	const lastLevelMultiplier = BOOST_LEVELS[BOOST_LEVELS.length - 1].multiplier;

	return clamp(multiplier, firstLevelMultiplier, lastLevelMultiplier);
};

export const calculateMultiplier = (native: number, nonNative: number): number => {
	const stakeRatio = (native / nonNative) * 100;
	return boostLevelByMatchingStakeRatio(stakeRatio).multiplier;
};

export const calculateNativeToMatchBoost = (native: number, nonNative: number, desiredBoost: number): number => {
	const levelFromDesiredBoost = boostLevelFromMatchingBoostMultiplier(desiredBoost);
	const nativeNeeded = nonNative * levelFromDesiredBoost.stakeRatioBoundary;
	const missingNative = nativeNeeded - native;

	return Math.max(missingNative, 0);
};

export const getRankAndLevelInformationFromStat = (stat: number, criteria: 'stake' | 'multiplier'): number[] => {
	let biggestRank = -1;
	let biggestLevel = -1;

	for (let rankIndex = 0; rankIndex < BOOST_RANKS.length; rankIndex++) {
		const rankLevels = BOOST_RANKS[rankIndex].levels;

		for (let levelIndex = 0; levelIndex < rankLevels.length; levelIndex++) {
			const boundaryOptions: Record<typeof criteria, number> = {
				stake: rankLevels[levelIndex].stakeRatioBoundary,
				multiplier: rankLevels[levelIndex].multiplier,
			};

			const boundary = boundaryOptions[criteria];

			if (stat >= boundary) {
				if (biggestLevel === -1) {
					// check whether its the first entry
					biggestLevel = levelIndex;
					biggestRank = rankIndex;
				} else if (stat > biggestLevel) {
					//compare the current value with the previous biggest value
					biggestLevel = levelIndex;
					biggestRank = rankIndex;
				}
			}
		}
	}

	if (biggestRank === -1) {
		biggestRank = 0;
	}

	if (biggestLevel === -1) {
		biggestLevel = 0;
	}

	return [biggestRank, biggestLevel];
};

export const rankNumberFromStakeRatio = (stakeRatio: number): number => {
	const [matchingLevelIndex] = getRankAndLevelInformationFromStat(stakeRatio, 'stake');
	return matchingLevelIndex;
};

export const rankFromStakeRatio = (stakeRatio: number): BoostRank => {
	return BOOST_RANKS[rankNumberFromStakeRatio(stakeRatio)];
};

export const boostLevelFromMatchingBoostMultiplier = (boostMultiplier: number): BoostRankLevel => {
	const { 1: matchingLevelIndex } = getRankAndLevelInformationFromStat(boostMultiplier, 'multiplier');
	return BOOST_LEVELS[matchingLevelIndex];
};

export const boostLevelNumberByMatchingStakeRatio = (stakeRatio: number): number => {
	const { 1: matchingLevelIndex } = getRankAndLevelInformationFromStat(stakeRatio, 'stake');
	return matchingLevelIndex;
};

export const boostLevelByMatchingStakeRatio = (stakeRatio: number): BoostRankLevel => {
	return BOOST_LEVELS[boostLevelNumberByMatchingStakeRatio(stakeRatio)];
};
