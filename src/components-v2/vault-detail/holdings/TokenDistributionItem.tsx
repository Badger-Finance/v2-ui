import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { VaultTokenBalance } from '../../../mobx/model/vaults/vault-token-balance';
import { numberWithCommas } from '../../../mobx/utils/helpers';
import TokenLogo from '../../TokenLogo';

const useStyles = makeStyles((theme) => ({
  tokenNameContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  tokenInfo: {
    color: theme.palette.common.black,
    fontWeight: 500,
  },
  tokenIconContainer: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    border: '2px solid white',
    borderRadius: '50%',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  icon: {
    width: '100%',
    objectFit: 'contain',
  },
}));

interface Props {
  tokenBalance: VaultTokenBalance;
}

export const TokenDistributionItem = ({ tokenBalance }: Props): JSX.Element => {
  const classes = useStyles();
  const displayAmount = numberWithCommas(tokenBalance.balance.toFixed(2));

  return (
    <Grid container alignItems="center" justifyContent="space-between">
      <div className={classes.tokenNameContainer}>
        <TokenLogo
          className={classes.tokenIconContainer}
          token={tokenBalance}
        />
        <Typography
          display="inline"
          variant="body1"
          className={classes.tokenInfo}
        >
          {tokenBalance.symbol}
        </Typography>
      </div>
      <Typography
        display="inline"
        variant="body1"
        className={classes.tokenInfo}
      >
        {displayAmount}
      </Typography>
    </Grid>
  );
};
