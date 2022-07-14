import { Container, Grid, makeStyles } from '@material-ui/core';
import mainnetDeploy from 'config/deployments/mainnet.json';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useReducer } from 'react';

import { Loader } from '../components/Loader';
import BveCvxInfoPanels from '../components-v2/BveCvxInfoPanels';
import BveCvxSpecs from '../components-v2/BveCvxSpecs';
import { VaultDeposit } from '../components-v2/common/dialogs/VaultDeposit';
import { VaultWithdraw } from '../components-v2/common/dialogs/VaultWithdraw';
import { MobileStickyActionButtons } from '../components-v2/vault-detail/actions/MobileStickyActionButtons';
import { Header } from '../components-v2/vault-detail/Header';
import { Holdings } from '../components-v2/vault-detail/holdings/Holdings';
import { TopContent } from '../components-v2/vault-detail/TopContent';
import { defaultVaultBalance } from '../components-v2/vault-detail/utils';
import { NETWORK_IDS, NETWORK_IDS_TO_NAMES } from '../config/constants';
import routes from '../config/routes';

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

const vaultAddress = mainnetDeploy.sett_system.vaults['native.icvx'];

const BveCvxInfluence = (): JSX.Element => {
  const {
    chain: { config },
    router,
    user,
    vaults,
    wallet,
  } = useContext(StoreContext);

  const classes = useStyles();
  const vault = vaults.getVault(vaultAddress);
  const [depositDisplayed, toggleDepositDisplayed] = useReducer((previous) => !previous, false);
  const [withdrawDisplayed, toggleWithdrawDisplay] = useReducer((previous) => !previous, false);

  if (config.chainId !== NETWORK_IDS.ETH) {
    router.goTo(routes.home, {}, { chain: NETWORK_IDS_TO_NAMES[NETWORK_IDS.ETH] });
  }

  if (!vault) {
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
            <BveCvxSpecs vault={vault} />
          </Grid>
          <Grid item xs={12} md={8} lg={9} className={classes.chartsContainer}>
            <BveCvxInfoPanels vault={vault} />
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

export default observer(BveCvxInfluence);
