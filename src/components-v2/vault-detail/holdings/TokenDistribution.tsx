import { VaultData } from '@badger-dao/sdk';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { TokenDistributionItem } from './TokenDistributionItem';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
  },
  title: {
    color: theme.palette.common.black,
    fontWeight: 600,
  },
  content: {
    marginTop: theme.spacing(1),
  },
}));

interface Props {
  settBalance: VaultData;
}

export const TokenDistribution = ({ settBalance }: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <Typography variant="body1" className={classes.title}>
        Token Distribution
      </Typography>
      <Grid container className={classes.content}>
        {settBalance.tokens.map((token, index) => (
          <TokenDistributionItem
            key={`${token.name}-${token.symbol}-${index}`}
            tokenBalance={token}
          />
        ))}
      </Grid>
    </Grid>
  );
};
