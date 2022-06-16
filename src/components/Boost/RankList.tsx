import React from 'react';

import { BOOST_RANKS, MIN_BOOST_RANK } from '../../config/system/boost-ranks';
import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import { RankItem } from './RankItem';

interface Props {
	currentStakeRatio?: number;
	accountStakeRatio?: number;
	onRankClick: (rank: BoostRank) => void;
}

export const RankList = ({
	currentStakeRatio = MIN_BOOST_RANK.stakeRatioBoundary, // default to first multiplier
	accountStakeRatio = MIN_BOOST_RANK.stakeRatioBoundary,
	onRankClick,
}: Props): JSX.Element => {
	return (
		<>
			{BOOST_RANKS.slice()
				.reverse()
				.map((rank, ranksIndex) => (
					<RankItem
						key={`${ranksIndex}_${rank.name}`}
						currentStakeRatio={currentStakeRatio}
						accountStakeRatio={accountStakeRatio}
						rank={rank}
						onRankClick={onRankClick}
					/>
				))}
		</>
	);
};
