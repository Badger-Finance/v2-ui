import { ButtonBase, Grid, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { BoostRank } from '../../mobx/model/boost/leaderboard-rank';
import { RankLevel } from './RankLevel';
import { RankProgressBarSlice } from './RankProgressBarSlice';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column-reverse',
    alignSelf: 'stretch',
  },
  buttonBase: {
    width: '100%',
  },
});

interface Props {
  currentStakeRatio: number;
  accountStakeRatio: number;
  rank: BoostRank;
  onRankClick: (rank: BoostRank) => void;
}

export const RankItem = ({
  accountStakeRatio,
  currentStakeRatio,
  onRankClick,
  rank,
}: Props): JSX.Element => {
  const rankStartBoundary = rank.stakeRatioBoundary;
  const isOwned = accountStakeRatio > rankStartBoundary;
  const hasBeenReached = currentStakeRatio >= rankStartBoundary;
  const classes = useStyles();
  return (
    <Grid container alignItems="flex-end">
      <Grid item className={classes.root}>
        <RankProgressBarSlice
          accountStakeRatio={accountStakeRatio}
          currentStakeRatio={currentStakeRatio}
          rank={rank}
        />
      </Grid>
      <Tooltip
        enterTouchDelay={0}
        title="Jump to rank"
        arrow
        disableFocusListener={hasBeenReached}
        disableHoverListener={hasBeenReached}
        disableTouchListener={hasBeenReached}
        placement="left"
        color="primary"
        key={`${rank.name}_${rank.signatureColor}`}
      >
        <Grid item xs>
          <ButtonBase
            className={classes.buttonBase}
            onClick={() => onRankClick(rank)}
            aria-label={`${rank.name} Rank`}
          >
            <RankLevel
              name={rank.name}
              signatureColor={rank.signatureColor}
              obtained={isOwned}
              hasBeenReached={hasBeenReached}
            />
          </ButtonBase>
        </Grid>
      </Tooltip>
    </Grid>
  );
};
