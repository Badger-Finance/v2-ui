import { VaultDTO } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

import { StyledDivider } from '../styled';
import { VaultToken } from './VaultToken';

const useStyles = makeStyles((theme) => ({
  title: {
    paddingBottom: theme.spacing(0.25),
  },
}));

interface Props {
  vault: VaultDTO;
}

export const Tokens = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();
  return (
    <Grid container>
      <Typography className={classes.title}>Tokens</Typography>
      <StyledDivider />
      <Grid container>
        {vault.tokens.map((token, index) => (
          <VaultToken
            key={`${vault.name}-${token.name}-${index}`}
            token={token}
          />
        ))}
      </Grid>
    </Grid>
  );
};
