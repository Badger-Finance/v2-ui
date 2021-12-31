import { BoostRank, BoostRankLevel } from '../mobx/model/boost/leaderboard-rank';
import { BOOST_LEVELS, BOOST_RANKS, MAX_BOOST_LEVEL, MIN_BOOST_LEVEL } from '../config/system/boost-ranks';
import { restrictToRange } from './componentHelpers';

/**
 * checks that a give multiplier value is within global boost levels multiplier boundaries
 */
export const isValidMultiplier = (multiplier: number): boolean => {
  const firstLevelMultiplier = MIN_BOOST_LEVEL.multiplier;
  const lastLevelMultiplier = MAX_BOOST_LEVEL.multiplier;

  return multiplier >= firstLevelMultiplier && multiplier <= lastLevelMultiplier;
};

/**
 * clamps given multiplier value to global boost levels multiplier boundaries
 * @return clamped clamped value
 */
export const sanitizeMultiplierValue = (multiplier: number): number => {
  const firstLevelMultiplier = MIN_BOOST_LEVEL.multiplier;
  const lastLevelMultiplier = MAX_BOOST_LEVEL.multiplier;

  return restrictToRange(multiplier, firstLevelMultiplier, lastLevelMultiplier);
};

/**
 * determines rank and level for a given native and non native balances.
 * uses rankAndLevelNumbersFromSpec(multiplier, 'multiplier') internally
 * @param native native balance
 * @param nonNative non native balance
 */
export const calculateMultiplier = (native: number, nonNative: number): number => {
  const stakeRatio = (native / nonNative) * 100;
  const [rankIndex, levelIndex] = rankAndLevelNumbersFromSpec(stakeRatio, 'stake');
  return BOOST_RANKS[rankIndex].levels[levelIndex].multiplier;
};

/**
 * calculates how much native needs to be added in order to reach the desired multiplier
 * uses rankAndLevelNumbersFromSpec(desiredMultiplier, 'multiplier') internally
 * @param native native balance
 * @param nonNative non native balance
 * @param desiredMultiplier
 */
export const calculateNativeToMatchMultiplier = (
  native: number,
  nonNative: number,
  desiredMultiplier: number,
): number => {
  const [rankIndex, levelIndex] = rankAndLevelNumbersFromSpec(desiredMultiplier, 'multiplier');
  const rank = BOOST_RANKS[rankIndex];
  const levelFromDesiredBoost = rank.levels[levelIndex];

  // if the target is the lowest boundary users would get leveled down pretty often because of the price changes.
  // using the rank's mid level number as "safe" leveling up amount helps making the stake ratio less exposed to price movements
  const safeLevelingAmount = (rank.levels[2].stakeRatioBoundary - rank.levels[1].stakeRatioBoundary) / 2;

  const comfortableStakeRatio = levelFromDesiredBoost.stakeRatioBoundary + safeLevelingAmount;
  const nativeNeeded = nonNative * (comfortableStakeRatio / 100);
  const missingNative = nativeNeeded - native;

  return Math.max(missingNative, 0);
};

/**
 * determines rank and level for a given multiplier.
 * uses rankAndLevelNumbersFromSpec(multiplier, 'multiplier') internally
 * @param multiplier reference point
 */
export const rankAndLevelFromMultiplier = (multiplier: number): [BoostRank, BoostRankLevel] => {
  const [rankIndex, levelIndex] = rankAndLevelNumbersFromSpec(multiplier, 'multiplier');
  return [BOOST_RANKS[rankIndex], BOOST_RANKS[rankIndex].levels[levelIndex]];
};

/**
 * determines rank and level for a given stake ratio.
 * Uses rankAndLevelNumbersFromSpec(stakeRatio, 'stake') internally
 * @param stakeRatio reference point
 */
export const rankAndLevelFromStakeRatio = (stakeRatio: number): [BoostRank, BoostRankLevel] => {
  const [rankIndex, levelIndex] = rankAndLevelNumbersFromSpec(stakeRatio, 'stake');
  return [BOOST_RANKS[rankIndex], BOOST_RANKS[rankIndex].levels[levelIndex]];
};

/**
 * gets the level next to the given level
 * @param currentLevel
 * @returns nextLevel if it exists, returns undefined otherwise
 */
export const getNextBoostLevel = (currentLevel: BoostRankLevel): BoostRankLevel | undefined => {
  const currentBoostLevelIndex = BOOST_LEVELS.findIndex(
    (_level) => _level.stakeRatioBoundary === currentLevel.stakeRatioBoundary,
  );
  return BOOST_LEVELS[currentBoostLevelIndex + 1];
};

/**
 * searches for rank and level numbers given either a stake ratio or a multiplier value as reference point
 * this is done by comparing each rank boost level to search any value that's greater than or equal to the given spec
 * if multiple levels are valid options, the highest value will be used
 *
 * @dev complexity is O(n^2) but data set is so small that in this case it's fine
 * @param spec data entry that will be used in the search
 * @param criteria search criteria to use in comparisons
 * @returns [rankIndex, levelIndex] highest matching rank and level
 */
export const rankAndLevelNumbersFromSpec = (spec: number, criteria: 'stake' | 'multiplier'): [number, number] => {
  let biggestRank = 0;
  const biggestLevelFromRank: Record<number, number> = {}; // each rank has its own biggest rank

  for (let rankIndex = 0; rankIndex < BOOST_RANKS.length; rankIndex++) {
    const rankLevels = BOOST_RANKS[rankIndex].levels;

    let biggestLevel = 0;

    for (let levelIndex = 0; levelIndex < rankLevels.length; levelIndex++) {
      let biggestNumberInLevel = -1;

      const comparisonOptions: Record<typeof criteria, number> = {
        stake: rankLevels[levelIndex].stakeRatioBoundary,
        multiplier: rankLevels[levelIndex].multiplier,
      };

      const comparisonValue = comparisonOptions[criteria];

      if (spec >= comparisonValue) {
        // no need to compare to last value because current index will always be greater than last value
        biggestRank = rankIndex;
        if (spec > biggestNumberInLevel) {
          // spec is greater than previous greatest value so it replaces it
          biggestLevel = levelIndex;
          biggestNumberInLevel = spec;
        }
      }
    }

    biggestLevelFromRank[rankIndex] = biggestLevel;
  }

  return [biggestRank, biggestLevelFromRank[biggestRank]];
};
