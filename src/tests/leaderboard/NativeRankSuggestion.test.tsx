import React from 'react';
import NativeRankSuggestion from 'components-v2/leaderboard/NativeRankSuggestion';
import { checkSnapshot } from 'tests/utils/snapshots';
import * as rankUtils from '../../utils/boost-ranks';

describe('NativeRankSuggestion', () => {
	describe('No user details available', () => {
		it('Does not display', () => checkSnapshot(<NativeRankSuggestion />));
	});

	describe('User with no amount to reach next rank', () => {
		it('Does not display', () => {
			jest.spyOn(rankUtils, 'calculateNativeToMatchBoost').mockImplementation();
			checkSnapshot(<NativeRankSuggestion />);
		});
	});

	describe('User with zero to reach next rank', () => {
		it('Does not display', () => {
			jest.spyOn(rankUtils, 'calculateNativeToMatchBoost').mockImplementation(() => 0);
			checkSnapshot(<NativeRankSuggestion />);
		});
	});

	describe('User with a positive amount to reach next rank', () => {
		it('Displays a suggestion for to increase native balance', () => {
			jest.spyOn(rankUtils, 'calculateNativeToMatchBoost').mockImplementation(() => 10);
			checkSnapshot(<NativeRankSuggestion />);
		});
	});
});
