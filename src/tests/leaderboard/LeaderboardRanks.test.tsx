import LeaderboardRanks from 'components-v2/leaderboard/LeaderboardRanks';
import { LeaderBoardEntry } from 'mobx/model/boost/leaderboard-entry';
import store from 'mobx/store';
import React from 'react';
import { TEST_ADDRESS, checkSnapshot } from 'tests/utils/snapshots';

describe('LeaderboardRanks', () => {
	const getLeaderboard = (length?: number): LeaderBoardEntry[] => {
		const entries: LeaderBoardEntry[] = [];
		const count = length ?? 10;
		for (let i = 0; i < count; i++) {
			entries.push({
				rank: i + 1,
				address: TEST_ADDRESS,
				stakeRatio: (10 - 10 / count).toFixed(2),
				boost: (3 - 2 / count).toFixed(2),
			});
		}
		return entries;
	};

	describe('No ranks loaded', () => {
		it('Displays loading skeletons', () => checkSnapshot(<LeaderboardRanks />));
	});

	describe('No user connected, ranks loaded', () => {
		it('Displays the leaderboard with no styling', () => {
			const { leaderBoard } = store;
			leaderBoard.ranks = leaderBoard.retrieveRanksInformation(getLeaderboard());
			checkSnapshot(<LeaderboardRanks />);
		});
	});

	describe('User connected, ranks loaded', () => {
		it.each([
			[3, 1, 'Frenzy Badger'],
			[2.3, 15, 'Hyper Badger'],
			[2, 55, 'Hero Badger'],
			[1.8, 105, 'Neo Badger'],
			[1.3, 175, 'Basic Badger'],
		])('Displays user with %f boost, %i rank, with %s highlighted', (boost, rank) => {
			store.wallet.connectedAddress = TEST_ADDRESS;
			store.user.accountDetails = {
				id: TEST_ADDRESS,
				boost: boost,
				boostRank: rank,
				nativeBalance: 0,
				nonNativeBalance: 10,
				multipliers: {},
				depositLimits: {},
				value: 0,
				earnedValue: 0,
				balances: [],
			};
			const { leaderBoard } = store;
			leaderBoard.ranks = leaderBoard.retrieveRanksInformation(getLeaderboard(200));
			checkSnapshot(<LeaderboardRanks />);
		});
	});
});
