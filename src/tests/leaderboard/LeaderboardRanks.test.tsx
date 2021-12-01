import { BadgerType, LeaderboardSummary } from '@badger-dao/sdk';
import LeaderboardRanks from 'components-v2/leaderboard/LeaderboardRanks';
import store from 'mobx/RootStore';
import React from 'react';
import { TEST_ADDRESS, checkSnapshot } from 'tests/utils/snapshots';

describe('LeaderboardRanks', () => {
	const testRanks: LeaderboardSummary = {
		summary: {
			[BadgerType.Basic]: 29503,
			[BadgerType.Neo]: 124,
			[BadgerType.Hero]: 167,
			[BadgerType.Hyper]: 231,
			[BadgerType.Frenzy]: 842,
		},
		updatedAt: Date.now(),
	};

	describe('No ranks loaded', () => {
		it('Displays loading skeletons', () => checkSnapshot(<LeaderboardRanks />));
	});

	describe('No user connected, ranks loaded', () => {
		it('Displays the leaderboard with no styling', () => {
			const { leaderBoard } = store;
			leaderBoard.ranks = testRanks;
			checkSnapshot(<LeaderboardRanks />);
		});
	});

	describe('User connected, ranks loaded', () => {
		it.each([
			[2000, 'Frenzy Badger'],
			[800, 'Hyper Badger'],
			[400, 'Hero Badger'],
			[100, 'Neo Badger'],
			[5, 'Basic Badger'],
		])('Displays user with %f boost, %i rank, with %s highlighted', (boost) => {
			store.onboard.address = TEST_ADDRESS;
			store.user.accountDetails = {
				address: TEST_ADDRESS,
				boost: boost,
				boostRank: 1,
				nativeBalance: 0,
				nonNativeBalance: 10,
				multipliers: {},
				value: 0,
				earnedValue: 0,
				stakeRatio: 0,
				data: {},
				claimableBalances: {},
			};
			const { leaderBoard } = store;
			leaderBoard.ranks = testRanks;
			checkSnapshot(<LeaderboardRanks />);
		});
	});
});
