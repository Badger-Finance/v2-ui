import { Dialog } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import ClaimRewardsContent from '../../rewards/ClaimRewardsContent';
import UserGuideContent from '../../rewards/UserGuideContent';

const useStyles = makeStyles(() =>
  createStyles({
    xlDialog: {
      maxWidth: 810,
    },
    bigDialog: {
      maxWidth: 672,
    },
  }),
);

const RewardsDialog = (): JSX.Element => {
  const { uiState } = useContext(StoreContext);
  const classes = useStyles();

  const [guideMode, setGuideMode] = useState(false);

  if (guideMode) {
    return (
      <Dialog
        fullWidth
        maxWidth="xl"
        aria-labelledby="user-guide"
        aria-describedby="Rewards User Guide"
        classes={{ paperWidthXl: classes.bigDialog }}
        open={uiState.rewardsDialogOpen}
        onClose={() => uiState.toggleRewardsDialog()}
      >
        <UserGuideContent onGoBack={() => setGuideMode(false)} onClose={() => uiState.toggleRewardsDialog()} />
      </Dialog>
    );
  }

  return (
    <Dialog
      fullWidth
      maxWidth="xl"
      aria-labelledby="claim-modal"
      aria-describedby="Claim your rewards"
      classes={{
        paperWidthXl: classes.xlDialog,
      }}
      open={uiState.rewardsDialogOpen}
      onClose={() => uiState.toggleRewardsDialog()}
    >
      <ClaimRewardsContent onGuideModeSelection={() => setGuideMode(true)} />
    </Dialog>
  );
};

export default observer(RewardsDialog);
