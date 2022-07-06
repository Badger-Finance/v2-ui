import {
  Box,
  Button,
  CircularProgress,
  makeStyles,
  Typography,
} from '@material-ui/core';
import useENS from 'hooks/useEns';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import { shortenAddress } from '../../utils/componentHelpers';

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
  const { uiState, wallet, transactions } = store;
  const { pendingTransactions } = transactions;

  async function connect(): Promise<void> {
    if (wallet.isConnected) {
      uiState.toggleWalletDrawer();
    } else {
      try {
        await wallet.connect();
      } catch (error) {
        const isModalClosed = String(error).includes('User closed modal');
        const isEmptyAccounts = String(error).includes(
          'Error: accounts received is empty',
        );
        if (!isModalClosed && !isEmptyAccounts) {
          console.error(error);
        }
      }
    }
  }

  const { ensName } = useENS(wallet.address);
  const walletAddress = wallet.address
    ? shortenAddress(wallet.address)
    : 'Connect';

  if (pendingTransactions.length > 0) {
    return (
      <Button
        variant="outlined"
        color="primary"
        classes={{ label: classes.walletButtonLabel }}
        onClick={connect}
      >
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
    <Button
      disableElevation
      color="primary"
      variant={wallet.isConnected ? 'outlined' : 'contained'}
      onClick={connect}
      classes={{ label: classes.walletButtonLabel }}
    >
      {ensName || walletAddress}
    </Button>
  );
});

export default WalletWidget;
