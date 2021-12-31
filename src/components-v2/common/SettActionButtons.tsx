import React from 'react';
import { Box, BoxProps, Button, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(-1),
  },
  button: {
    marginTop: theme.spacing(1),
  },
  deposit: {
    marginRight: theme.spacing(1),
  },
}));

export const SettActionButton = withStyles((theme) => ({
  disabled: { backgroundColor: 'rgba(255, 255, 255, 0.3)', color: theme.palette.common.white },
}))(Button);

interface Props extends BoxProps {
  isWithdrawDisabled?: boolean;
  isDepositDisabled?: boolean;
  onWithdrawClick: () => void;
  onDepositClick: () => void;
}

export const SettActionButtons = ({
  isDepositDisabled = false,
  isWithdrawDisabled = false,
  onWithdrawClick,
  onDepositClick,
  ...materialProps
}: Props): JSX.Element => {
  const classes = useStyles();

  return (
    <Box {...materialProps} className={clsx(classes.container, materialProps.className)}>
      <SettActionButton
        className={clsx(classes.button, classes.deposit)}
        color="primary"
        variant={isDepositDisabled ? 'outlined' : 'contained'}
        disabled={isDepositDisabled}
        onClick={onDepositClick}
      >
        Deposit
      </SettActionButton>
      <SettActionButton
        className={classes.button}
        color="primary"
        variant="outlined"
        disabled={isWithdrawDisabled}
        onClick={onWithdrawClick}
      >
        Withdraw
      </SettActionButton>
    </Box>
  );
};
