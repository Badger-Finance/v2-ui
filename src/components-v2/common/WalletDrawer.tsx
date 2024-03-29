import { Button, Drawer, Grid, IconButton, makeStyles, Typography, useTheme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

import useENS from '../../hooks/useEns';
import { shortenAddress } from '../../utils/componentHelpers';
import WalletTransactions from '../WalletTransactions';
import CopyToClipboardIcon from './CopyToClipboardIcon';
import CurrencyDisplay from './CurrencyDisplay';
import WalletLiquidityPoolLinks from './WalletLiquidityPoolLinks';
import WalletTokenBalance from './WalletTokenBalance';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 349,
    backgroundColor: theme.palette.background.paper,
    padding: '25px 25px 50px 25px',
    height: '100vh',
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
  },
  balanceText: {
    fontWeight: 400,
  },
  balance: {
    color: 'rgba(255, 255, 255, 0.87)',
    fontSize: 20,
  },
  disconnectWalletText: {
    textTransform: 'uppercase',
    color: '#91CDFF',
    fontWeight: 700,
  },
  titleRow: {
    marginBottom: theme.spacing(2),
  },
  addressRow: {
    marginBottom: theme.spacing(2),
  },
  balancesList: {
    marginTop: 32,
  },
  lpLinks: {
    marginTop: 20,
  },
  copiedMessage: {
    background: '#66BB6A',
    position: 'absolute',
    bottom: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(1),
  },
  copyWalletButton: {
    marginLeft: theme.spacing(4),
  },
  disconnectWalletIcon: {
    marginRight: theme.spacing(1),
  },
  address: {
    textTransform: 'uppercase',
  },
  copyToClipboard: {
    color: theme.palette.secondary.main,
  },
  transactions: {
    marginBottom: theme.spacing(4),
  },
}));

const WalletDrawer = (): JSX.Element | null => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const { uiState, user, chain, wallet } = useContext(StoreContext);
  const { ensName } = useENS(wallet.address);
  const classes = useStyles();
  const closeDialogTransitionDuration = useTheme().transitions.duration.leavingScreen;

  const handleCopy = () => {
    if (!wallet.address) return;
    const didCopy = copy(wallet.address);
    setShowCopiedMessage(didCopy);
  };

  const handleDisconnect = () => {
    uiState.toggleWalletDrawer();
    setTimeout(() => {
      wallet.disconnect();
    }, closeDialogTransitionDuration);
  };

  if (!wallet.address) {
    return null;
  }

  const tokenList = Chain.getChain(chain.network).deploy.tokens;
  const tokenBalances = Object.keys(tokenList).flatMap((token) => {
    const isBadgerToken = ['badger', 'digg'].includes(token.toLowerCase());
    return isBadgerToken ? [user.getBalance(tokenList[token])] : [];
  });

  const sortedBalances = tokenBalances.sort((a, b) => b.value - a.value);
  const totalBalance = tokenBalances.reduce((total, next) => (total += next.value), 0);

  return (
    <Drawer open={uiState.showWalletDrawer} anchor="right" onClose={() => uiState.toggleWalletDrawer()}>
      <Grid container direction="column" className={classes.root} justifyContent="space-between">
        <Grid item>
          <Grid item container justifyContent="space-between" alignItems="center" className={classes.titleRow}>
            <Typography variant="h6" display="inline" className={classes.title}>
              Wallet
            </Typography>
            <IconButton className={classes.closeButton} onClick={() => uiState.toggleWalletDrawer()}>
              <CloseIcon />
            </IconButton>
          </Grid>
          <Grid item container alignItems="center" className={classes.addressRow}>
            <Typography
              className={clsx(!ensName && classes.address)}
              variant="subtitle2"
              color="textSecondary"
              display="inline"
            >
              {ensName || shortenAddress(wallet.address)}
            </Typography>
            <IconButton onClick={handleCopy} aria-label="copy wallet address" className={classes.copyWalletButton}>
              <CopyToClipboardIcon className={classes.copyToClipboard} />
            </IconButton>
          </Grid>
          <Grid item container className={classes.transactions}>
            <WalletTransactions />
          </Grid>
          <Grid item>
            <Typography className={classes.balanceText} variant="subtitle2" color="textSecondary">
              Balance:
            </Typography>
            <CurrencyDisplay
              variant="body1"
              justifyContent="flex-start"
              displayValue={totalBalance.toFixed(2)}
              TypographyProps={{ className: classes.balance }}
            />
          </Grid>
          <Grid item container className={classes.balancesList}>
            {sortedBalances.map((tokenBalance) => (
              <WalletTokenBalance key={tokenBalance.token.address} balance={tokenBalance} />
            ))}
          </Grid>
          <Grid item container className={classes.lpLinks}>
            <WalletLiquidityPoolLinks />
          </Grid>
        </Grid>
        <Grid item>
          <Button
            variant="text"
            classes={{ label: classes.disconnectWalletText }}
            onClick={handleDisconnect}
            aria-label="disconnect wallet"
          >
            <img
              className={classes.disconnectWalletIcon}
              src="/assets/icons/disconnect-wallet.svg"
              aria-label="disconnect wallet"
              alt="disconnect wallet icon"
            />
            Disconnect Wallet
          </Button>
        </Grid>
      </Grid>
      {showCopiedMessage && (
        <Grid container className={classes.copiedMessage} alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" display="inline">
            Wallet Address Copied
          </Typography>
          <IconButton onClick={() => setShowCopiedMessage(false)} aria-label="dismiss copied address message">
            <CloseIcon />
          </IconButton>
        </Grid>
      )}
    </Drawer>
  );
};

export default observer(WalletDrawer);
