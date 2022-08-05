import { VaultDTO } from '@badger-dao/sdk';
import { Box, DialogTitle, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 3),
  },
  mode: {
    fontSize: 24,
    fontWeight: 500,
    color: '#ffffff',
  },
  settLogo: {
    width: '100%',
    margin: 'auto',
  },
  closeIcon: {
    cursor: 'pointer',
  },
}));

interface Props {
  vault: VaultDTO;
  mode: string;
  onClose: () => void;
}

export const VaultDialogTitle = ({ vault, mode, onClose }: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <DialogTitle className={classes.root}>
      <Grid container alignItems="center">
        <Grid item xs={6}>
          <Typography className={classes.mode} color="textSecondary">
            {mode}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Box display="flex" justifyContent="flex-end" alignItems="center">
            <CloseIcon className={classes.closeIcon} onClick={onClose} />
          </Box>
        </Grid>
      </Grid>
    </DialogTitle>
  );
};
