import React from 'react';
import { BOOST_LEVELS } from '../../config/system/boost-ranks';
import { RankProgressBar } from './RankProgressBar';
import { RankConnector } from './RankConnector';
import { BoostRank, BoostRankLevel } from '../../mobx/model/boost/leaderboard-rank';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  progressContainer: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignSelf: 'stretch',
  },
  progressEntry: {
    display: 'flex',
    flex: '1 1 0%',
    alignItems: 'flex-end',
  },
});

interface Props {
  accountMultiplier: number;
  currentBoostLevel: BoostRankLevel;
  currentMultiplier: number;
  rank: BoostRank;
  isMainSlice?: boolean;
}

export const RankProgressBarSlice = ({
  accountMultiplier,
  currentBoostLevel,
  currentMultiplier,
  rank,
  isMainSlice = false,
}: Props): JSX.Element => {
  const classes = useStyles();

  const currentBoostLevelIndex = BOOST_LEVELS.findIndex((level) => level.multiplier === currentBoostLevel.multiplier);
  const nextLevel = BOOST_LEVELS[currentBoostLevelIndex + 1];
  const levelRangeStart = currentBoostLevel.multiplier;
  const levelRangeEnd = nextLevel ? nextLevel.multiplier : currentBoostLevel.multiplier;

  return (
    <div className={classes.progressEntry}>
      <RankProgressBar
        multiplier={currentMultiplier}
        accountMultiplier={accountMultiplier}
        rangeStart={levelRangeStart}
        rangeEnd={levelRangeEnd}
      />
      <RankConnector signatureColor={rank.signatureColor} isMain={isMainSlice} />
    </div>
  );
};
