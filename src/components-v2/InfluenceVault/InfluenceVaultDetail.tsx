import { Container, Grid, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useReducer } from 'react';

import { Loader } from '../../components/Loader';
import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../../config/constants';
import routes from '../../config/routes';
import { StoreContext } from '../../mobx/stores/store-context';
import { VaultDeposit } from '../common/dialogs/VaultDeposit';
import { VaultWithdraw } from '../common/dialogs/VaultWithdraw';
import { MobileStickyActionButtons } from '../vault-detail/actions/MobileStickyActionButtons';
import { Header } from '../vault-detail/Header';
import { Holdings } from '../vault-detail/holdings/Holdings';
import { TopContent } from '../vault-detail/TopContent';
import { defaultVaultBalance } from '../vault-detail/utils';
import InfluenceVaultInfoPanel from './InfluenceVaultInfoPanel';
import InfluenceVaultSpecs from './InfluenceVaultSpecs';
import { getInfluenceVaultConfig } from './InfluenceVaultUtil';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(0.5),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      paddingBottom: theme.spacing(6),
    },
  },
  notReadyContainer: {
    textAlign: 'center',
    marginTop: theme.spacing(10),
  },
  holdingsContainer: {
    marginBottom: 20,
  },
  chartsContainer: {
    [theme.breakpoints.down('sm')]: {
      minHeight: 600,
    },
  },
}));

const InfluenceVaultDetail = (): JSX.Element => {
  const {
    chain: { config },
    router,
    user,
    vaultDetail,
    vaults,
    wallet,
  } = useContext(StoreContext);

  const { vault } = vaultDetail;

  const influenceVault = vault ? getInfluenceVaultConfig(vault?.vaultToken) : undefined;
  const classes = useStyles();

  // hmm, wtf dis?
  const badgerVault = vault ? vaults.getVault(vault.vaultToken) : undefined;
  const [depositDisplayed, toggleDepositDisplayed] = useReducer((previous) => !previous, false);
  const [withdrawDisplayed, toggleWithdrawDisplay] = useReducer((previous) => !previous, false);

  if (config.chainId !== NETWORK_IDS.ETH) {
    router.goTo(routes.home, {}, { chain: NETWORK_IDS_TO_NAMES[NETWORK_IDS.ETH] });
  }

  if (!vault || !badgerVault || !influenceVault) {
    return (
      <Container className={classes.root}>
        <div className={classes.notReadyContainer}>
          <Loader message="Loading Vault Information" />
        </div>
      </Container>
    );
  }

  const userData = user.accountDetails?.data[vault.vaultToken] ?? defaultVaultBalance(vault);

  return (
    <>
      <Container className={classes.root}>
        <Header />
        <TopContent vault={vault} />
        {wallet.isConnected && (
          <Grid container className={classes.holdingsContainer}>
            <Holdings
              vault={vault}
              userData={userData}
              onDepositClick={toggleDepositDisplayed}
              onWithdrawClick={toggleWithdrawDisplay}
            />
          </Grid>
        )}
        <Grid container spacing={1}>
          <Grid item xs={12} md={4} lg={3}>
            <InfluenceVaultSpecs vault={vault} config={influenceVault} />
          </Grid>
          <Grid item xs={12} md={8} lg={9} className={classes.chartsContainer}>
            <InfluenceVaultInfoPanel vault={vault} config={influenceVault} />
          </Grid>
        </Grid>
      </Container>
      <MobileStickyActionButtons
        vault={vault}
        onDepositClick={toggleDepositDisplayed}
        onWithdrawClick={toggleWithdrawDisplay}
      />
      <VaultDeposit open={depositDisplayed} vault={vault} onClose={toggleDepositDisplayed} />
      <VaultWithdraw open={withdrawDisplayed} vault={vault} onClose={toggleWithdrawDisplay} />
    </>
  );
};

export default observer(InfluenceVaultDetail);
