import { SDKProvider } from '@badger-dao/sdk';
import { makeStyles } from '@material-ui/core';
import { watchAccount, watchNetwork, watchProvider } from '@wagmi/core';
import { Web3Button } from '@web3modal/react';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';

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

  useEffect(() => {
    const unwatch = watchAccount((account) => {
      store.wallet.accountChange(account);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    // Action for subscribing to network changes.
    const unwatch = watchNetwork((network) => {
      store.wallet.networkChange(network);
    });
    return unwatch;
  }, []);

  useEffect(() => {
    // Action for subscribing to provider changes.
    const unwatch = watchProvider({}, (provider) => store.wallet.providerChange(provider as SDKProvider));
    return unwatch;
  }, []);

  // useEffect(() => {
  //   console.log(connector?.onAccountsChanged(() => {}));
  // }, [connector]);

  // const { uiState, wallet, transactions } = store;
  // const { pendingTransactions } = transactions;

  // async function connect(): Promise<void> {
  //   if (wallet.isConnected) {
  //     uiState.toggleWalletDrawer();
  //   } else {
  //     try {
  //       await wallet.connect();
  //     } catch (error) {
  //       const isModalClosed = String(error).includes('User closed modal');
  //       const isEmptyAccounts = String(error).includes('Error: accounts received is empty');
  //       if (!isModalClosed && !isEmptyAccounts) {
  //         console.error(error);
  //       }
  //     }
  //   }
  // }

  // const { ensName } = useENS(wallet.address);
  // const walletAddress = wallet.address ? shortenAddress(wallet.address) : 'Connect';

  // if (pendingTransactions.length > 0) {
  //   return (
  //     <Button variant="outlined" color="primary" classes={{ label: classes.walletButtonLabel }} onClick={connect}>
  //       <Box display="flex" alignContent="center">
  //         <CircularProgress size={14} className={classes.spinner} />
  //         <Typography display="inline" className={classes.transactionsCount}>
  //           {pendingTransactions.length}
  //         </Typography>
  //       </Box>
  //     </Button>
  //   );
  // }

  return (
    <>
      <Web3Button icon="hide" label="Connect" />
      {/* <Button
        disableElevation
        color="primary"
        variant={wallet.isConnected ? 'outlined' : 'contained'}
        onClick={connect}
        classes={{ label: classes.walletButtonLabel }}
      >
        {ensName || walletAddress}
      </Button> */}
    </>
  );
});

export default WalletWidget;
