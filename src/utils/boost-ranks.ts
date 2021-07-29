import { BoostRank, BoostRankLevel } from '../mobx/model/boost/leaderboard-rank';
import { BOOST_LEVELS, BOOST_RANKS, MAX_BOOST_LEVEL, MIN_BOOST_LEVEL } from '../config/system/boost-ranks';
import { clamp } from './componentHelpers';

export const isValidMultiplier = (multiplier: number): boolean => {
	const firstLevelMultiplier = MIN_BOOST_LEVEL.multiplier;
	const lastLevelMultiplier = MAX_BOOST_LEVEL.multiplier;

	return multiplier >= firstLevelMultiplier && multiplier <= lastLevelMultiplier;
};

export const sanitizeMultiplierValue = (multiplier: number): number => {
	const firstLevelMultiplier = MIN_BOOST_LEVEL.multiplier;
	const lastLevelMultiplier = MAX_BOOST_LEVEL.multiplier;

	return clamp(multiplier, firstLevelMultiplier, lastLevelMultiplier);
};

export const calculateMultiplier = (native: number, nonNative: number): number => {
	const stakeRatio = (native / nonNative) * 100;
	const [rankIndex, levelIndex] = getRankAndLevelInformationFromStat(stakeRatio, 'stake');
	return BOOST_RANKS[rankIndex].levels[levelIndex].multiplier;
};

export const calculateNativeToMatchMultiplier = (
	native: number,
	nonNative: number,
	desiredMultiplier: number,
): number => {
	const [rankIndex, levelIndex] = getRankAndLevelInformationFromStat(desiredMultiplier, 'multiplier');
	const levelFromDesiredBoost = BOOST_RANKS[rankIndex].levels[levelIndex];
	const nativeNeeded = nonNative * (levelFromDesiredBoost.stakeRatioBoundary / 100);
	const missingNative = nativeNeeded - native;

	return Math.max(missingNative, 0);
};

export const rankAndLevelFromMultiplier = (multiplier: number): [BoostRank, BoostRankLevel] => {
	const [rankIndex, levelIndex] = getRankAndLevelInformationFromStat(multiplier, 'multiplier');
	return [BOOST_RANKS[rankIndex], BOOST_RANKS[rankIndex].levels[levelIndex]];
};

export const rankAndLevelFromStakeRatio = (stakeRatio: number): [BoostRank, BoostRankLevel] => {
	const [rankIndex, levelIndex] = getRankAndLevelInformationFromStat(stakeRatio, 'stake');
	return [BOOST_RANKS[rankIndex], BOOST_RANKS[rankIndex].levels[levelIndex]];
};

export const getNextBoostLevel = (currentLevel: BoostRankLevel): BoostRankLevel | undefined => {
	const currentBoostLevelIndex = BOOST_LEVELS.findIndex(
		(_level) => _level.stakeRatioBoundary === currentLevel.stakeRatioBoundary,
	);
	return BOOST_LEVELS[currentBoostLevelIndex + 1];
};

// TODO: add doc for this
export const getRankAndLevelInformationFromStat = (
	spec: number,
	criteria: 'stake' | 'multiplier',
): [number, number] => {
	let biggestRank = 0;
	const biggestLevelFromRank: Record<number, number> = {};

	for (let rankIndex = 0; rankIndex < BOOST_RANKS.length; rankIndex++) {
		const rankLevels = BOOST_RANKS[rankIndex].levels;

		let biggestLevel = 0;

		for (let levelIndex = 0; levelIndex < rankLevels.length; levelIndex++) {
			// value check for this level
			let biggestNumberInLevel = -1;
			const boundaryOptions: Record<typeof criteria, number> = {
				stake: rankLevels[levelIndex].stakeRatioBoundary,
				multiplier: rankLevels[levelIndex].multiplier,
			};

			const boundary = boundaryOptions[criteria];

			if (spec >= boundary) {
				biggestRank = rankIndex;
				if (spec > biggestNumberInLevel) {
					biggestLevel = levelIndex;
					biggestNumberInLevel = spec;
				}
			}
		}

		biggestLevelFromRank[rankIndex] = biggestLevel;
	}

	return [biggestRank, biggestLevelFromRank[biggestRank]];
};
