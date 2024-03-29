import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import { getNextBoostRank } from '../../utils/boost-ranks';
import { RankConnector } from './RankConnector';
import { RankProgressBar } from './RankProgressBar';

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
  rank: BoostRank;
  currentStakeRatio: number;
  accountStakeRatio: number;
}

export const RankProgressBarSlice = ({ rank, currentStakeRatio, accountStakeRatio }: Props): JSX.Element => {
  const classes = useStyles();
  const nextLevel = getNextBoostRank(rank) || rank;
  return (
    <div className={classes.progressEntry}>
      <RankProgressBar
        currentStakeRatio={currentStakeRatio}
        accountStakeRatio={accountStakeRatio}
        rangeStart={rank.stakeRatioBoundary}
        rangeEnd={nextLevel.stakeRatioBoundary}
      />
      <RankConnector signatureColor={rank.signatureColor} />
    </div>
  );
};
