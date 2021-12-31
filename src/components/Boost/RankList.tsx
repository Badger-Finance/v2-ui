import React from 'react';
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

          return (
            <RankItem
              key={`${ranksIndex}_${rankStartBoundary}_${rank.name}`}
              currentMultiplier={currentMultiplier}
              accountMultiplier={accountMultiplier}
              rank={rank}
              rankIndex={ranksIndex}
              onRankClick={onRankClick}
              isOwned={isOwnedByAccount}
              hasBeenReached={hasRankBeenReached}
            />
          );
        })}
    </>
  );
};
