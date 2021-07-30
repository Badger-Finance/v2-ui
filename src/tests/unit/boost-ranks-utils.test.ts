import 'jest';
import { BOOST_LEVELS, BOOST_RANKS, MAX_BOOST_LEVEL, MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';
import {
	calculateMultiplier,
	calculateNativeToMatchMultiplier,
	getNextBoostLevel,
	rankAndLevelNumbersFromSpec,
	isValidMultiplier,
	rankAndLevelFromMultiplier,
	rankAndLevelFromStakeRatio,
	sanitizeMultiplierValue,
} from '../../utils/boost-ranks';

describe('Boost Ranks Utils', () => {
	describe('rankAndLevelFromMultiplier', () => {
		const inputTable = BOOST_LEVELS.map((level) => [level.multiplier, level.multiplier]);
		test.each(inputTable)('rankAndLevelFromMultiplier(%f) returns %f', (levelMultiplier, returnLevelMultiplier) => {
			const { 1: levelFromMultiplier } = rankAndLevelFromMultiplier(levelMultiplier);
			expect(levelFromMultiplier.multiplier).toEqual(returnLevelMultiplier);
		});
	});

	describe('rankAndLevelFromStakeRatio', () => {
		const inputTable = BOOST_LEVELS.map((level) => [level.stakeRatioBoundary, level.stakeRatioBoundary]);
		test.each(inputTable)('rankAndLevelFromStakeRatio(%f) returns %f', (stakeRatio, returnStakeRatio) => {
			const { 1: levelFromStakeRatio } = rankAndLevelFromStakeRatio(stakeRatio);
			expect(levelFromStakeRatio.stakeRatioBoundary).toEqual(returnStakeRatio);
		});
	});

	describe('getNextBoostLevel', () => {
		const inputTable = BOOST_LEVELS.map((level, index, levels) => [level, levels[index + 1]]);
		test.each(inputTable)('getNextBoostLevel(%p) returns %p', (currentLevel, nextLevel) => {
			expect(getNextBoostLevel(currentLevel)).toEqual(nextLevel);
		});
	});

	describe('isValidMultiplier', () => {
		const inputTable = [
			[1, true],
			[100, true],
			[800, true],
			[-1, false],
			[Infinity, false],
		];
		test.each(inputTable)('isValidMultiplier(%p) returns %p', (multiplier: any, result) => {
			expect(isValidMultiplier(multiplier)).toEqual(result);
		});
	});

	describe('sanitizeMultiplierValue', () => {
		const inputTable = [
			[-1, MIN_BOOST_LEVEL.multiplier],
			[200, 200],
			[800, 800],
			[331.12, 331.12],
			[2100, MAX_BOOST_LEVEL.multiplier],
			[Infinity, MAX_BOOST_LEVEL.multiplier],
		];
		test.each(inputTable)('sanitizeMultiplierValue(%p) returns %p', (multiplier, result) => {
			expect(sanitizeMultiplierValue(multiplier)).toEqual(result);
		});
	});

	describe('calculateMultiplier', () => {
		const inputTable = [
			[1, 1000, 2],
			[3, 1000, 5],
			[5, 1000, 10],
			[10, 1000, 20],
			[100, 1000, 200],
			[200, 1000, 400],
			[300, 1000, 600],
			[712.12, 1000, 1400],
			[712312, 1000, 2000],
		];
		test.each(inputTable)('calculateMultiplier(%p, %p) returns %p', (native, nonNative, result) => {
			expect(calculateMultiplier(native, nonNative)).toEqual(result);
		});
	});

	describe('calculateNativeToMatchBoost', () => {
		const inputTable = [
			[1, 1000, 2000, 2000],
			[3, 1000, 600, 600],
			[5, 1000, 1000, 1000],
			[0, 1231212, 1600, 1600],
		];
		test.each(inputTable)(
			'calculateNativeToMatchBoost(%p, %p, %p) returns %p',
			(native, nonNative, desiredMultiplier) => {
				const nativeRequired = calculateNativeToMatchMultiplier(native, nonNative, desiredMultiplier);
				const addedNative = nativeRequired + native;
				const multiplierWithAddedNative = calculateMultiplier(addedNative, nonNative);
				expect(multiplierWithAddedNative).toEqual(desiredMultiplier);
			},
		);
	});

	describe('getRankAndLevelInformationFromStat', () => {
		const stakeRadioTable = BOOST_RANKS.map((rank, rankIndex) => {
			return rank.levels.map((level, levelIndex) => [level.stakeRatioBoundary, 'stake', [rankIndex, levelIndex]]);
		}).flat();

		const multiplierTable = BOOST_RANKS.map((rank, rankIndex) => {
			return rank.levels.map((level, levelIndex) => [level.multiplier, 'multiplier', [rankIndex, levelIndex]]);
		}).flat();

		test.each([...stakeRadioTable, ...multiplierTable])(
			'getRankAndLevelInformationFromStat(%f, %s) returns %p',
			(spec: any, criteria: any, result) => {
				expect(rankAndLevelNumbersFromSpec(spec, criteria)).toEqual(result);
			},
		);
	});
});
