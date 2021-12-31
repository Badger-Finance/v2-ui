import React from 'react';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 8,
    width: 240,
    height: 240,
  },
  logo: {
    width: '80%',
  },
}));

export const BoostBadge = observer(() => {
  const classes = useStyles();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" className={classes.root}>
      <img alt="Badger Logo" src={'assets/badger-logo.png'} className={classes.logo} />
    </Box>
  );
});
