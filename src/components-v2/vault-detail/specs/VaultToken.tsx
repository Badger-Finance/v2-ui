import { TokenValue } from '@badger-dao/sdk';
import { Box, Grid, GridProps, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

import { numberWithCommas } from '../../../mobx/utils/helpers';
import TokenLogo from '../../TokenLogo';

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: 20,
  },
  specName: {
    fontSize: 12,
    lineHeight: '1.66',
  },
  tokenSpec: {
    marginBottom: theme.spacing(1),
  },
  tokenName: {
    marginLeft: theme.spacing(1),
  },
  tokenImage: {
    width: 16,
    height: 16,
  },
}));

interface Props extends GridProps {
  token: TokenValue;
}

export const VaultToken = ({ token, className, ...muiProps }: Props): JSX.Element => {
  const classes = useStyles();
  const decimalsAmount = token.balance > 1 ? 0 : 4;
  const balanceDisplay = token.balance.toFixed(decimalsAmount);

  return (
    <Grid className={clsx(classes.tokenSpec, className)} container justifyContent="space-between" {...muiProps}>
      <Box display="flex" alignItems="center">
        <TokenLogo className={classes.tokenImage} token={token} />
        <Typography display="inline" color="textSecondary" className={clsx(classes.specName, classes.tokenName)}>
          {token.name}
        </Typography>
      </Box>
      <Typography display="inline" variant="subtitle2">
        {numberWithCommas(balanceDisplay)}
      </Typography>
    </Grid>
  );
};
