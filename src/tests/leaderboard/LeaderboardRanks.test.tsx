import LeaderboardRanks from 'components-v2/leaderboard/LeaderboardRanks';
import { LeaderBoardBadger } from 'mobx/model/boost/leader-board-badger';
import store from 'mobx/RootStore';
import React from 'react';
import { TEST_ADDRESS, checkSnapshot } from 'tests/utils/snapshots';

const sampleLeaderboard: LeaderBoardBadger[] = [
	{
		rank: 1,
		address: TEST_ADDRESS,
		boost: 2000,
		stakeRatio: 4.343118855233512,
	},
	{
		rank: 2,
		address: TEST_ADDRESS,
		boost: 2000,
		stakeRatio: 3.0060280539696356,
	},

	{
		address: TEST_ADDRESS,
		rank: 3,
		boost: 1400,
		stakeRatio: 0.7551662858130394,
	},
	{
		address: TEST_ADDRESS,
		rank: 4,
		boost: 1400,
		stakeRatio: 0.7098336457883909,
	},
	{
		address: TEST_ADDRESS,
		rank: 5,
		boost: 1200,
		stakeRatio: 0.6049623751849297,
	},
	{
		address: TEST_ADDRESS,
		rank: 6,
		boost: 1200,
		stakeRatio: 0.6782448787103922,
	},
	{
		address: TEST_ADDRESS,
		rank: 7,
		boost: 1000,
		stakeRatio: 0.5646514396023578,
	},
	{
		address: TEST_ADDRESS,
		rank: 8,
		boost: 1000,
		stakeRatio: 0.5365229145208065,
	},
	{
		address: TEST_ADDRESS,
		rank: 9,
		boost: 800,
		stakeRatio: 0.4227945796905033,
	},
	{
		address: TEST_ADDRESS,
		rank: 10,
		boost: 800,
		stakeRatio: 0.41560396348310596,
	},
	{
		address: TEST_ADDRESS,
		rank: 11,
		boost: 600,
		stakeRatio: 0.3330185843780852,
	},
	{
		address: TEST_ADDRESS,
		rank: 12,
		boost: 600,
		stakeRatio: 0.3514762738664632,
	},
	{
		address: TEST_ADDRESS,
		rank: 13,
		boost: 500,
		stakeRatio: 0.26131763158249754,
	},
	{
		address: TEST_ADDRESS,
		rank: 14,
		boost: 500,
		stakeRatio: 0.2613322909158488,
	},
	{
		address: TEST_ADDRESS,
		rank: 15,
		boost: 400,
		stakeRatio: 0.21008473642656894,
	},
	{
		address: TEST_ADDRESS,
		rank: 16,
		boost: 400,
		stakeRatio: 0.21584477547738448,
	},
	{
		address: TEST_ADDRESS,
		rank: 17,
		boost: 300,
		stakeRatio: 0.19225532735062548,
	},
	{
		address: TEST_ADDRESS,
		rank: 18,
		boost: 300,
		stakeRatio: 0.18764510696997203,
	},
	{
		address: TEST_ADDRESS,
		rank: 19,
		boost: 200,
		stakeRatio: 0.12110884776751031,
	},
	{
		address: TEST_ADDRESS,
		rank: 20,
		boost: 200,
		stakeRatio: 0.13077953134434794,
	},
	{
		address: TEST_ADDRESS,
		rank: 21,
		boost: 150,
		stakeRatio: 0.08680094249470965,
	},
	{
		address: TEST_ADDRESS,
		rank: 22,
		boost: 150,
		stakeRatio: 0.09100241830191003,
	},
	{
		address: TEST_ADDRESS,
		rank: 23,
		boost: 100,
		stakeRatio: 0.06554748535831123,
	},
	{
		address: TEST_ADDRESS,
		rank: 24,
		boost: 100,
		stakeRatio: 0.0726991432801324,
	},
	{
		address: TEST_ADDRESS,
		rank: 25,
		boost: 50,
		stakeRatio: 0.02977990226948852,
	},
	{
		address: TEST_ADDRESS,
		rank: 26,
		boost: 50,
		stakeRatio: 0.027875916728120845,
	},
	{
		address: TEST_ADDRESS,
		rank: 27,
		boost: 20,
		stakeRatio: 0.019865110541208823,
	},
	{
		address: TEST_ADDRESS,
		rank: 28,
		boost: 20,
		stakeRatio: 0.023962769213890615,
	},
	{
		address: TEST_ADDRESS,
		rank: 29,
		boost: 10,
		stakeRatio: 0.0064318199205439415,
	},
	{
		address: TEST_ADDRESS,
		rank: 30,
		boost: 10,
		stakeRatio: 0.00638385794473242,
	},
	{
		address: TEST_ADDRESS,
		rank: 31,
		boost: 5,
		stakeRatio: 0.004952904107870835,
	},
	{
		address: TEST_ADDRESS,
		rank: 32,
		boost: 5,
		stakeRatio: 0.0030146603442737087,
	},
	{
		address: TEST_ADDRESS,
		rank: 33,
		boost: 2,
		stakeRatio: 0.0011070807471060913,
	},
	{
		address: TEST_ADDRESS,
		rank: 34,
		boost: 2,
		stakeRatio: 0.0024739321886481694,
	},
	{
		address: TEST_ADDRESS,
		rank: 35,
		boost: 1,
		stakeRatio: 0,
	},
	{
		address: TEST_ADDRESS,
		rank: 36,
		boost: 1,
		stakeRatio: 0,
	},
];

describe('LeaderboardRanks', () => {
	describe('No ranks loaded', () => {
		it('Displays loading skeletons', () => checkSnapshot(<LeaderboardRanks />));
	});

	describe('No user connected, ranks loaded', () => {
		it('Displays the leaderboard with no styling', () => {
			const { leaderBoard } = store;
			leaderBoard.ranks = leaderBoard.retrieveRanksInformation(sampleLeaderboard);
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
			store.wallet.connectedAddress = TEST_ADDRESS;
			store.user.accountDetails = {
				id: TEST_ADDRESS,
				boost: boost,
				boostRank: 1,
				nativeBalance: 0,
				nonNativeBalance: 10,
				multipliers: {},
				depositLimits: {},
				value: 0,
				earnedValue: 0,
				balances: [],
				stakeRatio: 0,
			};
			const { leaderBoard } = store;
			leaderBoard.ranks = leaderBoard.retrieveRanksInformation(sampleLeaderboard);
			checkSnapshot(<LeaderboardRanks />);
		});
	});
});
