import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import SpecsCard from './specs/SpecsCard';
import { ChartsCard } from './charts/ChartsCard';
import { Holdings } from './holdings/Holdings';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '../../mobx/store-context';
import { BadgerSett } from '../../mobx/model/vaults/badger-sett';
import { NewVaultWarning } from './NewVaultWarning';
import { BalanceNamespace } from 'web3/config/namespaces';
import { Vault, VaultState } from '@badger-dao/sdk';

const useStyles = makeStyles((theme) => ({
  content: {
    margin: 'auto',
  },
  holdingsContainer: {
    marginBottom: theme.spacing(2),
  },
  guardedVault: {
    marginBottom: theme.spacing(2),
  },
  settInfoTitle: {
    fontSize: 24,
    fontWeight: 500,
  },
  chartsContainer: {
    [theme.breakpoints.down('sm')]: {
      minHeight: 600,
    },
  },
}));

interface Props {
  sett: Vault;
  badgerSett: BadgerSett;
}

export const MainContent = observer(({ badgerSett, sett }: Props): JSX.Element => {
  const { user, onboard } = React.useContext(StoreContext);

  const classes = useStyles();
  const tokenBalance = user.getBalance(BalanceNamespace.Token, badgerSett);
  const settBalance = user.getSettBalance(sett);

  return (
    <Grid container className={classes.content}>
      {onboard.isActive() && (
        <Grid container className={classes.holdingsContainer}>
          <Holdings sett={sett} badgerSett={badgerSett} tokenBalance={tokenBalance} userData={settBalance} />
        </Grid>
      )}
      <Grid container spacing={1}>
        <Grid item xs={12} md={4} lg={3}>
          <SpecsCard sett={sett} badgerSett={badgerSett} />
        </Grid>
        <Grid item xs={12} md={8} lg={9} className={classes.chartsContainer}>
          <ChartsCard sett={sett} />
        </Grid>
      </Grid>
      {sett.state === VaultState.Guarded && (
        <Grid container className={classes.guardedVault}>
          <NewVaultWarning />
        </Grid>
      )}
    </Grid>
  );
});
