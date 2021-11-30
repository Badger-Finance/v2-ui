import { BadgerType } from '@badger-dao/sdk';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';

export const BOOST_RANKS: BoostRank[] = [
	{
		name: 'Basic Badger',
		signatureColor: '#F2A52B',
		levels: [
			{
				stakeRatioBoundary: 0,
				multiplier: 1,
			},
			{
				stakeRatioBoundary: 0.1,
				multiplier: 2,
			},
			{
				stakeRatioBoundary: 0.25,
				multiplier: 5,
			},
			{
				stakeRatioBoundary: 0.5,
				multiplier: 10,
			},
		],
	},
	{
		name: 'Neo Badger',
		signatureColor: '#74D189',
		levels: [
			{
				stakeRatioBoundary: 1,
				multiplier: 20,
			},
			{
				stakeRatioBoundary: 2.5,
				multiplier: 50,
			},
			{
				stakeRatioBoundary: 5,
				multiplier: 100,
			},
			{
				stakeRatioBoundary: 7.5,
				multiplier: 150,
			},
		],
	},
	{
		name: 'Hero Badger',
		signatureColor: '#40C6FF',
		levels: [
			{
				stakeRatioBoundary: 10,
				multiplier: 200,
			},
			{
				stakeRatioBoundary: 15,
				multiplier: 300,
			},
			{
				stakeRatioBoundary: 20,
				multiplier: 400,
			},
			{
				stakeRatioBoundary: 25,
				multiplier: 500,
			},
		],
	},
	{
		name: 'Hyper Badger',
		signatureColor: '#A274D1',
		levels: [
			{
				stakeRatioBoundary: 30,
				multiplier: 600,
			},
			{
				stakeRatioBoundary: 40,
				multiplier: 800,
			},
			{
				stakeRatioBoundary: 50,
				multiplier: 1000,
			},
			{
				stakeRatioBoundary: 60,
				multiplier: 1200,
			},
		],
	},
	{
		name: 'Frenzy Badger',
		signatureColor: '#F44336',
		levels: [
			{
				stakeRatioBoundary: 70,
				multiplier: 1400,
			},
			{
				stakeRatioBoundary: 80,
				multiplier: 1600,
			},
			{
				stakeRatioBoundary: 90,
				multiplier: 1800,
			},
			{
				stakeRatioBoundary: 100,
				multiplier: 2000,
			},
		],
	},
];

export const BOOST_LEVELS = BOOST_RANKS.flatMap((rank) => rank.levels);

export const MIN_BOOST_LEVEL = BOOST_LEVELS[0];

export const MAX_BOOST_LEVEL = BOOST_LEVELS[BOOST_LEVELS.length - 1];

export const BADGER_TYPE_BOOSTS: Record<string, BoostRank> = {
	[BadgerType.Basic]: BOOST_RANKS[0],
	[BadgerType.Neo]: BOOST_RANKS[1],
	[BadgerType.Hero]: BOOST_RANKS[2],
	[BadgerType.Hyper]: BOOST_RANKS[3],
	[BadgerType.Frenzy]: BOOST_RANKS[4],
};
