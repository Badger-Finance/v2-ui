import LeaderboardAccountInformation from 'components-v2/leaderboard/LeaderboardAccountInformation';
import store from 'mobx/RootStore';
import React from 'react';
import { TEST_ADDRESS, checkSnapshot } from 'tests/utils/snapshots';

describe('LeaderboardAccountInformation', () => {
	describe('No user connected', () => {
		it('Displays fields as N/A', () => checkSnapshot(<LeaderboardAccountInformation />));
	});

	describe('User connected, no data loaded', () => {
		it('Displays fields as loading skeletons', () => {
			store.onboard.address = TEST_ADDRESS;
			checkSnapshot(<LeaderboardAccountInformation />);
		});
	});

	describe('User connected, data loaded', () => {
		it('Displays user rank, and boost', () => {
			store.onboard.address = TEST_ADDRESS;
			store.user.accountDetails = {
				address: TEST_ADDRESS,
				boost: 2,
				boostRank: 10,
				nativeBalance: 0,
				nonNativeBalance: 10,
				multipliers: {},
				claimableBalances: {},
				value: 0,
				earnedValue: 0,
				data: {},
				stakeRatio: 0,
			};
			checkSnapshot(<LeaderboardAccountInformation />);
		});
	});
});
