import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { percentageBetweenRange, roundWithPrecision } from '../../utils/componentHelpers';
import { getColorFromComparison } from './utils';

const useStyles = makeStyles(() => ({
  rankBar: {
    position: 'relative',
    alignSelf: 'stretch',
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

const useProgressStyles = (
  currentStakeRatio: number,
  accountStakeRatio: number,
  rangeStart: number,
  rangeEnd: number,
) => {
  return makeStyles((theme) => {
    // we select the highest number as this will decide the bar height
    const highestMultiplierPoint = Math.max(currentStakeRatio, accountStakeRatio);

    const rawBarHeight = percentageBetweenRange(highestMultiplierPoint, rangeEnd, rangeStart);
    const sanitizedBarHeight = Math.min(rawBarHeight, 100); // don't exceed container height

    const isAlreadyOwned = accountStakeRatio > rangeEnd;
    const isStillOwned = currentStakeRatio > rangeEnd;

    // no need to show progress for already acquired levels
    const greaterCaseColor = isAlreadyOwned ? theme.palette.primary.main : '#74D189';

    // even if current boost is less than account boost, if it's still greater than the start of this level
    // then it means it still owns it
    const lessCaseColor = isStillOwned ? theme.palette.primary.main : theme.palette.error.main;

    const differenceColor = getColorFromComparison({
      toCompareValue: roundWithPrecision(currentStakeRatio, 4),
      toBeComparedValue: roundWithPrecision(accountStakeRatio, 4),
      defaultColor: theme.palette.primary.main,
      greaterCaseColor,
      lessCaseColor,
    });

    return {
      progressBar: {
        position: 'absolute',
        bottom: 0,
        background: differenceColor,
        width: 4,
        height: `${sanitizedBarHeight}%`,
      },
    };
  });
};

interface Props {
  currentStakeRatio: number;
  accountStakeRatio: number;
  rangeStart: number;
  rangeEnd: number;
}

export const RankProgressBar = ({ currentStakeRatio, accountStakeRatio, rangeStart, rangeEnd }: Props): JSX.Element => {
  const classes = useStyles();
  const progressClasses = useProgressStyles(currentStakeRatio, accountStakeRatio, rangeStart, rangeEnd)();
  return (
    <div className={classes.rankBar}>
      <div className={progressClasses.progressBar} />
    </div>
  );
};
