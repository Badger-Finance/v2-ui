import { Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

import { BveCvxInfoDialog } from '../BveCvxInfoDialog';

const useStyles = makeStyles(() => ({
  feeSpec: {
    marginBottom: 25,
  },
  specTitle: {
    fontWeight: 700,
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
}

const BveCvxInfluenceFeesInfo = ({ open, onClose }: Props): JSX.Element => {
  const classes = useStyles();
  return (
    <BveCvxInfoDialog open={open} onClose={onClose}>
      <BveCvxInfoDialog.Title onClose={onClose} title="Vote Influence Fees" />
      <BveCvxInfoDialog.Content>
        <Typography variant="body1" color="textSecondary">
          Each voting round, a portion of the vote influence accumulated by bveCVX votes to support liquidity for bveCVX
          and BADGER, and to support DAO operations.
        </Typography>
        <BveCvxInfoDialog.Divider />
        <Grid container direction="column">
          <Grid item className={classes.feeSpec}>
            <Typography className={classes.specTitle} variant="body2" color="textSecondary">
              bveCVX Liquidity Support:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              5% of each vote is sold for bribes and paid as BADGER to bveCVX/CVX LPs
            </Typography>
          </Grid>
          <Grid item className={classes.feeSpec}>
            <Typography className={classes.specTitle} variant="body2" color="textSecondary">
              BADGER Liquidity Support:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              5% of each vote votes for WBTC/BADGER
            </Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.specTitle} variant="body2" color="textSecondary">
              DAO Operations Fee:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              5% of each vote is sold for bribes and paid to the DAO
            </Typography>
          </Grid>
        </Grid>
      </BveCvxInfoDialog.Content>
    </BveCvxInfoDialog>
  );
};

export default BveCvxInfluenceFeesInfo;
