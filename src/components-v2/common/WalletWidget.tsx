import { SDKProvider } from '@badger-dao/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, CircularProgress, makeStyles, Typography } from '@material-ui/core';
import { watchAccount, watchNetwork, watchProvider } from '@wagmi/core';
import { Web3Button } from '@web3modal/react';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';
import { shortenAddress } from 'utils/componentHelpers';
import { useAccount, useProvider } from 'wagmi';

const useStyles = makeStyles((theme) => ({
  walletDot: {
    display: 'block',
    width: theme.spacing(0.9),
    height: theme.spacing(0.8),
    marginLeft: theme.spacing(0.4),
    borderRadius: theme.spacing(0.4),
  },
  redDot: {
    background: theme.palette.error.main,
  },
  greenDot: {
    background: theme.palette.success.main,
  },
  walletButtonLabel: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'none',
  },
  transactionsCount: {
    marginLeft: theme.spacing(1),
  },
  spinner: {
    margin: 'auto',
  },
}));

const WalletWidget = observer(() => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { isConnected, address } = useAccount();
  const provider = useProvider();

  useEffect(() => {
    store.wallet.providerChange(provider as SDKProvider);
  }, []);

  /**
   * Action for subscribing to account changes.
   */
  useEffect(() => {
    const unwatch = watchAccount((account) => {
      store.wallet.accountChange(account);
    });
    return unwatch;
  }, []);

  /**
   * Action for subscribing to network changes.
   */
  useEffect(() => {
    const unwatch = watchNetwork((network) => {
      store.wallet.networkChange(network);
    });
    return unwatch;
  }, []);

  /**
   * Action for subscribing to provider changes.
   */
  useEffect(() => {
    const unwatch = watchProvider({}, (provider) => {
      store.wallet.providerChange(provider as Web3Provider);
    });
    return unwatch;
  }, []);

  const { pendingTransactions } = store.transactions;

  async function connect(): Promise<void> {
    if (isConnected) {
      store.uiState.toggleWalletDrawer();
    }
  }

  if (pendingTransactions.length > 0) {
    return (
      <Button variant="outlined" color="primary" classes={{ label: classes.walletButtonLabel }} onClick={connect}>
        <Box display="flex" alignContent="center">
          <CircularProgress size={14} className={classes.spinner} />
          <Typography display="inline" className={classes.transactionsCount}>
            {pendingTransactions.length}
          </Typography>
        </Box>
      </Button>
    );
  }

  return (
    <>
      {!isConnected && <Web3Button icon="hide" label="Connect" />}
      {isConnected && address && (
        <Button
          disableElevation
          color="primary"
          variant={isConnected ? 'outlined' : 'contained'}
          onClick={connect}
          classes={{ label: classes.walletButtonLabel }}
        >
          {shortenAddress(address)}
        </Button>
      )}
    </>
  );
});

export default WalletWidget;
