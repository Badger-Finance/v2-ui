import BoostSuggestion from 'components-v2/leaderboard/BoostSuggestion';
import store from 'mobx/RootStore';
import React from 'react';
import { TEST_ADDRESS, checkSnapshot } from 'tests/utils/snapshots';

describe('BoostSuggestion', () => {
  describe('No user details available', () => {
    it('Does not display', () => checkSnapshot(<BoostSuggestion />));
  });

  describe('User with some non native balance', () => {
    it('Does not display', () => {
      store.user.accountDetails = {
        id: TEST_ADDRESS,
        boost: 2,
        boostRank: 10,
        nativeBalance: 0,
        nonNativeBalance: 10,
        multipliers: {},
        depositLimits: {},
        value: 0,
        earnedValue: 0,
        balances: [],
      };
      checkSnapshot(<BoostSuggestion />);
    });
  });

  describe('User with no non native balance', () => {
    it('Displays a suggestion to increase non native balance', () => {
      store.user.accountDetails = {
        id: TEST_ADDRESS,
        boost: 2,
        boostRank: 10,
        nativeBalance: 0,
        nonNativeBalance: 0,
        multipliers: {},
        depositLimits: {},
        value: 0,
        earnedValue: 0,
        balances: [],
      };
      checkSnapshot(<BoostSuggestion />);
    });
  });
});
