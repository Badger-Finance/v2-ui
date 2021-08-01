import React from 'react';
import { Tooltip } from '@material-ui/core';
import { BOOST_RANKS, MIN_BOOST_LEVEL } from '../../config/system/boost-ranks';
import { RankItem } from './RankItem';

interface Props {
	currentMultiplier?: number;
	accountMultiplier?: number;
	onRankClick: (boost: number) => void;
}

export const RankList = ({
	currentMultiplier = MIN_BOOST_LEVEL.multiplier, // default to first multiplier
	accountMultiplier = MIN_BOOST_LEVEL.multiplier,
	onRankClick,
}: Props): JSX.Element => {
	return (
		<>
			{BOOST_RANKS.slice()
				.reverse()
				.map((rank, ranksIndex) => {
					const rankStartBoundary = rank.levels[0].multiplier;

					const isOwnedByAccount = accountMultiplier > rankStartBoundary;
					const hasRankBeenReached = currentMultiplier >= rankStartBoundary;

					const rankItem = (
						<RankItem
							key={`${ranksIndex}_${rankStartBoundary}_${rank.name}`}
							currentMultiplier={currentMultiplier}
							accountMultiplier={accountMultiplier}
							rank={rank}
							onRankClick={onRankClick}
							isOwned={isOwnedByAccount}
							hasBeenReached={hasRankBeenReached}
						/>
					);

					if (!hasRankBeenReached) {
						return (
							<Tooltip
								title="Jump to rank"
								arrow
								placement="left"
								color="primary"
								key={`${ranksIndex}_${rank.name}_${rankStartBoundary}`}
							>
								<div>{rankItem}</div>
							</Tooltip>
						);
					}

					return rankItem;
				})}
		</>
	);
};
