import { Grid, makeStyles, Typography } from '@material-ui/core';
import { DEBUG } from 'config/environment';
import { observer } from 'mobx-react-lite';
import React from 'react';

const useStyles = makeStyles({
  root: {
    minHeight: 38,
    padding: '14px 26px',
    background: '#FFB84D',
  },
  messageLinkContainer: {
    display: 'flex',
  },
  linkIcon: {
    marginRight: 6,
  },
  actionButton: {
    color: '#2E44C0',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  link: {
    color: '#2E44C0',
    letterSpacing: '0.0025em',
    fontSize: 14,
    fontWeight: 'bold',
  },
  message: {
    fontWeight: 'normal',
    fontSize: 14,
    letterSpacing: 0.25,
    color: 'rgba(0, 0, 0, 0.87)',
    marginRight: 12,
  },
  actionContainer: {
    paddingLeft: 40,
  },
  closeIcon: {
    color: '#2E44C0',
    margin: '-12px',
    '& svg': {
      fontSize: 24,
    },
  },
});

const BetaAdvisory = (): JSX.Element | null => {
  const classes = useStyles();

  if (!DEBUG) {
    return null;
  }

  return (
    <Grid container alignItems="center" className={classes.root} justifyContent="center">
      <Typography className={classes.message}>
        This application is currently in Beta. Features may not be fully functional. Use at your own risk.
      </Typography>
    </Grid>
  );
};

export default observer(BetaAdvisory);
