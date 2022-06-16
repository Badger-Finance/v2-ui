import { BadgerType } from '@badger-dao/sdk';

import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';

export const BOOST_RANKS: BoostRank[] = [
	{
		name: 'Basic Badger',
		signatureColor: '#F2A52B',
		stakeRatioBoundary: 0,
	},
	{
		name: 'Neo Badger',
		signatureColor: '#74D189',
		stakeRatioBoundary: 0.75,
	},
	{
		name: 'Hero Badger',
		signatureColor: '#40C6FF',
		stakeRatioBoundary: 1.25,
	},
	{
		name: 'Hyper Badger',
		signatureColor: '#A274D1',
		stakeRatioBoundary: 2.25,
	},
	{
		name: 'Frenzy Badger',
		signatureColor: '#F44336',
		stakeRatioBoundary: 3,
	},
];

export const MIN_BOOST_RANK = BOOST_RANKS[0];
export const MIN_BOOST = 1;
export const MAX_BOOST_RANK = BOOST_RANKS[BOOST_RANKS.length - 1];
export const MAX_BOOST = 3000;

export const BADGER_TYPE_BOOSTS: Record<BadgerType, BoostRank> = {
	[BadgerType.Basic]: BOOST_RANKS[0],
	[BadgerType.Neo]: BOOST_RANKS[1],
	[BadgerType.Hero]: BOOST_RANKS[2],
	[BadgerType.Hyper]: BOOST_RANKS[3],
	[BadgerType.Frenzy]: BOOST_RANKS[4],
};
