import { formatBalance, VaultDTO } from '@badger-dao/sdk';
import { Divider, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { MAX_FEE } from 'config/constants';
import { BigNumber, BigNumberish } from 'ethers';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StrategyFee } from '../../../mobx/model/system-config/stategy-fees';
import { formatStrategyFee } from '../../../utils/componentHelpers';
import { getVaultStrategyFee } from 'mobx/utils/fees';
import { TokenBalance } from 'mobx/model/tokens/token-balance';

const useStyles = makeStyles((theme) => ({
  specName: {
    fontSize: 12,
    lineHeight: '1.66',
  },
  divider: {
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props {
  vault: VaultDTO;
  balance: TokenBalance;
}

export const VaultConversionAndFee = observer(
  ({ vault, balance }: Props): JSX.Element => {
    const { vaults } = React.useContext(StoreContext);
    const classes = useStyles();

    const withdrawFee = getVaultStrategyFee(vault, StrategyFee.withdraw);
    const depositToken = vaults.getToken(vault.underlyingToken);
    const depositTokenSymbol = depositToken?.symbol || '';
    const depositTokenDecimals = depositToken?.decimals || 18;

    const withdrawAmount = balance.scale(vault.pricePerFullShare);
    const withdrawalFee = withdrawAmount.tokenBalance
      .mul(withdrawFee)
      .div(MAX_FEE);
    const amountAfterFee = withdrawAmount.tokenBalance.sub(withdrawalFee);

    return (
      <Grid container>
        <Typography>Fees</Typography>
        <Divider className={classes.divider} />
        <Grid container justifyContent="space-between">
          <Typography
            className={classes.specName}
            color="textSecondary"
            display="inline"
          >
            Converted Amount
          </Typography>
          <Typography display="inline" variant="subtitle2">
            {`${formatBalance(
              withdrawAmount.tokenBalance,
              depositTokenDecimals,
            )} ${depositTokenSymbol}`}
          </Typography>
        </Grid>
        <Grid container justifyContent="space-between">
          <Typography
            className={classes.specName}
            color="textSecondary"
            display="inline"
          >
            {`Estimated Fee (${formatStrategyFee(withdrawFee)})`}
          </Typography>
          <Typography display="inline" variant="subtitle2">
            {`${formatBalance(
              withdrawalFee,
              depositTokenDecimals,
            )} ${depositTokenSymbol}`}
          </Typography>
        </Grid>
        <Grid container justifyContent="space-between">
          <Typography
            className={classes.specName}
            color="textSecondary"
            display="inline"
          >
            You will receive
          </Typography>
          <Typography display="inline" variant="subtitle2">
            {`${formatBalance(
              amountAfterFee,
              depositTokenDecimals,
            )} ${depositTokenSymbol}`}
          </Typography>
        </Grid>
      </Grid>
    );
  },
);
