import { VaultDTOV3 } from '@badger-dao/sdk';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MAX_FEE } from 'config/constants';
import { StoreContext } from 'mobx/stores/store-context';
import { getVaultStrategyFee } from 'mobx/utils/fees';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StrategyFee } from '../../../mobx/model/system-config/stategy-fees';
import { formatStrategyFee } from '../../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
  specName: {
    fontSize: 14,
    lineHeight: '1.66',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  feeRow: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  vault: VaultDTOV3;
  balance: number;
}

export const VaultConversionAndFee = observer(({ vault, balance }: Props): JSX.Element => {
  const { vaults } = React.useContext(StoreContext);
  const classes = useStyles();

  const withdrawFee = getVaultStrategyFee(vault, StrategyFee.withdraw);
  const { symbol } = vaults.getToken(vault.underlyingToken);

  const withdrawAmount = balance * vault.pricePerFullShare;
  const withdrawalFee = (withdrawAmount * withdrawFee) / MAX_FEE;
  const amountAfterFee = withdrawAmount - withdrawalFee;

  return (
    <Grid container>
      <Grid container justifyContent="space-between">
        <Typography className={classes.specName} color="textSecondary" display="inline">
          {`Withdraw Fee (${formatStrategyFee(withdrawFee)})`}
        </Typography>
        <Typography display="inline" variant="subtitle2">
          {`${withdrawalFee.toFixed(6)} ${symbol}`}
        </Typography>
      </Grid>
      <Grid container justifyContent="space-between" className={classes.feeRow}>
        <Typography className={classes.specName} color="textSecondary" display="inline">
          Total Withdrawal
        </Typography>
        <Typography display="inline" variant="subtitle2">
          {`${amountAfterFee.toFixed(6)} ${symbol}`}
        </Typography>
      </Grid>
    </Grid>
  );
});
