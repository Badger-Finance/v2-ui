import { VaultDTO } from '@badger-dao/sdk';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BVE_CVX_TOKEN } from 'mobx/stores/bveCvxInfluenceStore';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { numberWithCommas } from '../../mobx/utils/helpers';

const useStyles = makeStyles((theme) => ({
  amount: {
    fontSize: 28,
    lineHeight: '1.334',
  },
  currencyIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
  },
}));

interface Props {
  vault: VaultDTO;
}

const VaultDepositedAssets = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();

  // TODO: we should probably include an 'influence' vault behavior
  const isBveCvx = vault.vaultToken === BVE_CVX_TOKEN;

  let displayValue;

  if (isBveCvx) {
    displayValue = `${numberWithCommas(vault.balance.toFixed())} ${vault.asset}`;
  } else {
    displayValue = `$${numberWithCommas(vault.value.toFixed())}`;
  }

  return <Typography className={classes.amount}>{displayValue}</Typography>;
};

export default observer(VaultDepositedAssets);
