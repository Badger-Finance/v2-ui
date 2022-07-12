import { formatBalance, VaultCaps } from '@badger-dao/sdk';
import { makeStyles, Typography } from '@material-ui/core';
import React from 'react';

import { MAX } from '../../../config/constants';

const useStyles = makeStyles((theme) => ({
  limitsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      marginBottom: theme.spacing(1),
    },
  },
  depositContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(1),
    },
  },
}));

export interface DepositLimitProps {
  asset: string;
  vaultCaps: VaultCaps;
}

export const VaultAvailableDeposit = (props: DepositLimitProps): JSX.Element | null => {
  const displayDecimals = 4;
  const classes = useStyles();
  const { vaultCaps, asset } = props;
  if (!vaultCaps) {
    return null;
  }
  const { totalDepositCap, userDepositCap, remainingDepositCap, remainingUserDepositCap } = vaultCaps;
  const displayUserCap = remainingDepositCap.lte(userDepositCap) ? remainingUserDepositCap : userDepositCap;
  const isMaxUserCap = userDepositCap.eq(MAX);
  const isMaxTotalCap = remainingDepositCap.eq(MAX);

  if (isMaxTotalCap && isMaxUserCap) {
    return null;
  }

  return (
    <div className={classes.limitsContainer}>
      {!isMaxUserCap && (
        <div className={classes.depositContainer}>
          <Typography align="center" variant="body2" color="textSecondary">
            User Deposit Limit Remaining:{' '}
          </Typography>
          <Typography align="center" variant="body2" color="textSecondary" component="div">
            {`${formatBalance(displayUserCap).toFixed(5)} / ${formatBalance(userDepositCap).toFixed(5)} ${asset}`}
          </Typography>
        </div>
      )}
      {!isMaxTotalCap && (
        <div className={classes.depositContainer}>
          <Typography align="center" variant="body2" color="textSecondary">
            Total Deposit Limit Remaining:{' '}
          </Typography>
          <Typography align="center" variant="body2" color="textSecondary" component="div">
            {`${formatBalance(remainingDepositCap).toFixed(5)} / ${formatBalance(totalDepositCap).toFixed(5)} ${asset}`}
          </Typography>
        </div>
      )}
    </div>
  );
};
