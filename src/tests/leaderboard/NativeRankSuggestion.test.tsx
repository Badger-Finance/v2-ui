import BigNumber from 'bignumber.js';
import NativeRankSuggestion from 'components-v2/leaderboard/NativeRankSuggestion';
import store from 'mobx/store';
import React from 'react';
import { verifyComponent } from 'tests/utils/snapshots';

describe('NativeRankSuggestion', () => {
	describe('No user details available', () => {
		it('Does not display', () => verifyComponent(<NativeRankSuggestion />));
	});

	describe('User with no amount to reach next rank', () => {
		it('Does not display', () => {
			jest.spyOn(store.boostOptimizer, 'calculateNativeToMatchBoost').mockImplementation();
			verifyComponent(<NativeRankSuggestion />);
		});
	});

	describe('User with zero to reach next rank', () => {
		it('Does not display', () => {
			jest.spyOn(store.boostOptimizer, 'calculateNativeToMatchBoost').mockImplementation(() => new BigNumber(0));
			verifyComponent(<NativeRankSuggestion />);
		});
	});

	describe('User with a positive amount to reach next rank', () => {
		it('Displays a suggestion for to increase native balance', () => {
			jest.spyOn(store.boostOptimizer, 'calculateNativeToMatchBoost').mockImplementation(() => new BigNumber(10));
			verifyComponent(<NativeRankSuggestion />);
		});
	});
});
