import { Grid, Link, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import { DelaySeverity } from 'mobx/model/vaults/vault-rewards';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { ESTIMATED_REWARDS_FREQUENCY } from '../../../config/constants';
import { StyledDivider } from '../styled';
import { calculateDelaySeverity, calculateDifferenceInHoursFromCycle } from '../utils';
import BveCvxFrequencyInfo from '../../BveCvxFrequencyInfo';

const useStyles = makeStyles((theme) => ({
  rewardsFrequency: {
    width: '100%',
  },
  frequencyDetail: {
    fontSize: 11,
    width: '100%',
  },
  infoLink: {
    fontSize: 11,
  },
  reward: {
    padding: '2px 4px',
    borderRadius: 4,
    fontSize: 12,
  },
  rewardContainer: {
    textAlign: 'end',
  },
  mediumDelayedReward: {
    backgroundColor: '#D97706',
  },
  highlyDelayedReward: {
    backgroundColor: theme.palette.error.main,
  },
  noneDelayedReward: {
    border: `1px solid ${theme.palette.divider}`,
  },
  linkIcon: {
    fontSize: 11,
  },
  linkContent: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export const Claims = observer((): JSX.Element => {
  const { tree } = React.useContext(StoreContext);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const classes = useStyles();

  const differenceInHoursFromCycle = calculateDifferenceInHoursFromCycle(tree.lastUpdateTimestamp);
  const delaySeverity = calculateDelaySeverity(differenceInHoursFromCycle);

  const isDelayed = delaySeverity !== DelaySeverity.None;

  const delayStyles = {
    [DelaySeverity.High]: classes.highlyDelayedReward,
    [DelaySeverity.Medium]: classes.mediumDelayedReward,
    [DelaySeverity.None]: classes.noneDelayedReward,
  };

  return (
    <Grid container>
      <Grid container alignItems="center">
        <Grid container item xs={7}>
          <Typography>Reward Frequency</Typography>
        </Grid>
        <Grid className={classes.rewardContainer} item xs>
          <Typography className={clsx(classes.reward, delayStyles[delaySeverity])} display="inline">
            {`~${ESTIMATED_REWARDS_FREQUENCY} Hours`}
          </Typography>
        </Grid>
      </Grid>
      <StyledDivider />
      <Typography className={classes.frequencyDetail} variant="caption" color="textSecondary">
        {isDelayed
          ? 'This Vaults’s rewards are currently taking longer than usual.'
          : 'This Vaults’s rewards are currently being processed.'}
      </Typography>
      <Link
				className={classes.infoLink}
				href="https://docs.badger.com/badger-finance/vaults/overview-and-fees#cycles-and-claiming"
				target="_blank"
				rel="noreferrer"
      >
				<div className={classes.linkContent}>
					<span>See more</span>
					<ChevronRightIcon className={classes.linkIcon} />
				</div>
      </Link>
      <BveCvxFrequencyInfo open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} />
    </Grid>
  );
});
