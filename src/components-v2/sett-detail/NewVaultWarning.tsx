import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  guardedVault: {
    display: 'flex',
    justifyContent: 'center',
    padding: theme.spacing(1),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 8,
  },
  guardedVaultText: {
    fontSize: 14,
    color: theme.palette.primary.main,
    fontWeight: 400,
  },
  boldText: {
    fontWeight: 'bold',
  },
}));

export const NewVaultWarning = (): JSX.Element => {
  const classes = useStyles();

  return (
    <Grid container className={classes.guardedVault}>
      <Typography className={classes.guardedVaultText}>
        <span className={classes.boldText}>NOTE:</span> This new vault may take up to{' '}
        <span className={classes.boldText}>2 weeks</span> from launch to reach full efficiency
      </Typography>
    </Grid>
  );
};
