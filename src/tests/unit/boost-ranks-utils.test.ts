import { BadgerType } from '@badger-dao/sdk';

import { BADGER_TYPE_BOOSTS, MAX_BOOST_RANK } from '../../config/system/boost-ranks';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import {
  calculateNativeToMatchRank,
  calculateUserBoost,
  clampStakeRatio,
  getHighestRankFromStakeRatio,
  getNextBoostRank,
  isValidStakeRatio,
} from '../../utils/boost-ranks';

describe('Boost Ranks Utils', () => {
  describe('calculateNativeToMatchRank', () => {
    const inputTable = [
      [10, 1000, BadgerType.Hero, 1241.245, BADGER_TYPE_BOOSTS.hero],
      [900, 1000, BadgerType.Frenzy, 2102.55, BADGER_TYPE_BOOSTS.frenzy],
      [900, 1000, BadgerType.Hero, 350.8, BADGER_TYPE_BOOSTS.hero],
      [900, 1000, BadgerType.Basic, 0, BADGER_TYPE_BOOSTS.basic],
    ];
    test.each(inputTable)(
      'calculateNativeToMatchRank(%p, %p, %p) returns %p',
      (native, nonNative, _name, needed, targetRank) => {
        expect(calculateNativeToMatchRank(native as number, nonNative as number, targetRank as BoostRank)).toEqual(
          needed,
        );
      },
    );
  });

  describe('clampStakeRatio', () => {
    const inputTable = [
      [-1, 0],
      [Infinity, MAX_BOOST_RANK.stakeRatioBoundary],
    ];
    test.each(inputTable)('clampStakeRatio(%p) returns %p', (multiplier, result) => {
      expect(clampStakeRatio(multiplier)).toEqual(result);
    });
  });

  describe('getHighestRankFromStakeRatio', () => {
    const inputTable = [
      [0, BadgerType.Basic, BADGER_TYPE_BOOSTS.basic],
      [0.23, BadgerType.Basic, BADGER_TYPE_BOOSTS.basic],
      [0.75, BadgerType.Neo, BADGER_TYPE_BOOSTS.neo],
      [1.25, BadgerType.Hero, BADGER_TYPE_BOOSTS.hero],
      [2.3, BadgerType.Hyper, BADGER_TYPE_BOOSTS.hyper],
      [3, BadgerType.Frenzy, BADGER_TYPE_BOOSTS.frenzy],
      [1_000_000, BadgerType.Frenzy, BADGER_TYPE_BOOSTS.frenzy],
    ];
    test.each(inputTable)('getHighestRankFromStakeRatio(%p) returns %p', (stakeRatio, _badgerType, result) => {
      expect(getHighestRankFromStakeRatio(stakeRatio as number)).toEqual(result);
    });
  });

  describe('getNextBoostRank', () => {
    const inputTable = [
      [BadgerType.Basic, BadgerType.Neo, BADGER_TYPE_BOOSTS.basic, BADGER_TYPE_BOOSTS.neo],
      [BadgerType.Neo, BadgerType.Hero, BADGER_TYPE_BOOSTS.neo, BADGER_TYPE_BOOSTS.hero],
      [BadgerType.Hero, BadgerType.Hyper, BADGER_TYPE_BOOSTS.hero, BADGER_TYPE_BOOSTS.hyper],
      [BadgerType.Hyper, BadgerType.Basic, BADGER_TYPE_BOOSTS.hyper, BADGER_TYPE_BOOSTS.frenzy],
      [BadgerType.Hyper, BadgerType.Hyper, BADGER_TYPE_BOOSTS.frenzy, BADGER_TYPE_BOOSTS.frenzy],
    ];
    test.each(inputTable)('getNextBoostRank(of:%s) returns %p', (_name, _toName, fromRank, toRank) => {
      expect(getNextBoostRank(fromRank as BoostRank)).toEqual(toRank);
    });
  });

  describe('calculateUserBoost', () => {
    const inputTable = [
      [0, 1],
      [1, 2000],
      [1.5, 2500],
      [2, 2750],
      [2.5, 2875],
      [3, 3000],
    ];
    test.each(inputTable)('calculateUserBoost(stakeRatio:%p) returns %p', (stakeRatio, userBoost) => {
      expect(calculateUserBoost(stakeRatio)).toEqual(userBoost);
    });
  });

  describe('calculateNativeToMatchBoost', () => {
    test.each([
      [1, 1000, BADGER_TYPE_BOOSTS.hyper],
      [3, 1000, BADGER_TYPE_BOOSTS.neo],
      [5, 1000, BADGER_TYPE_BOOSTS.hero],
      [0, 1231212, BADGER_TYPE_BOOSTS.frenzy],
    ])('calculateNativeToMatchRank(%p, %p, %p) returns %p', (native, nonNative, desiredRank) => {
      const nativeRequired = calculateNativeToMatchRank(native, nonNative, desiredRank);
      const addedNative = nativeRequired + (native as number);
      const stakeRatio = addedNative / (nonNative as number);
      expect(getHighestRankFromStakeRatio(stakeRatio).stakeRatioBoundary).toEqual(
        (desiredRank as BoostRank).stakeRatioBoundary,
      );
    });
  });

  describe('isValidStakeRatio', () => {
    it.each([
      [0, true],
      [1, true],
      [2.1212, true],
      [-1, false],
      [Infinity, false],
    ])('isValidStakeRatio(%p) returns %p', (multiplier, result) => {
      expect(isValidStakeRatio(multiplier)).toEqual(result);
    });
  });
});
