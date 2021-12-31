import { makeStyles, Typography } from '@material-ui/core';
import { Loader } from 'components/Loader';
import { observer } from 'mobx-react-lite';
import { StoreContext } from 'mobx/store-context';
import React, { useContext } from 'react';
import SettListItem from './SettListItem';
import SettTable from './SettTable';
import { inCurrency } from 'mobx/utils/helpers';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { BalanceNamespace } from 'web3/config/namespaces';
import { Currency } from 'config/enums/currency.enum';
import { BouncerType, Vault, VaultState, ValueSource } from '@badger-dao/sdk';
import IbbtcVaultDepositDialog from '../ibbtc-vault/IbbtcVaultDepositDialog';
import { isSettVaultIbbtc } from '../../utils/componentHelpers';

const useStyles = makeStyles((theme) => ({
  messageContainer: {
    paddingTop: theme.spacing(4),
    textAlign: 'center',
  },
  noDeposit: {
    marginTop: theme.spacing(8),
  },
  tableContainer: {
    marginBottom: theme.spacing(2),
  },
}));

const createSettListItem = (sett: Vault, itemBalance: TokenBalance, currency: Currency): JSX.Element | null => {
  const isIbbtc = isSettVaultIbbtc(sett);

  if (!itemBalance || itemBalance.tokenBalance.eq(0)) {
    return null;
  }
  return (
    <SettListItem
      accountView
      key={itemBalance.token.address}
      sett={sett}
      balance={itemBalance.balance}
      balanceValue={itemBalance.balanceValueDisplay(currency)}
      currency={currency}
      CustomDepositModal={isIbbtc ? IbbtcVaultDepositDialog : undefined}
    />
  );
};

const UserListDisplay = observer(() => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const {
    setts,
    user,
    uiState: { currency },
    network: { network },
  } = store;

  const currentSettMap = setts.getSettMap();

  if (currentSettMap === undefined || user.loadingBalances) {
    return <Loader message={`Loading My ${network.name} Setts...`} />;
  }

  if (currentSettMap === null) {
    return (
      <div className={classes.messageContainer}>
        <Typography variant="h4">There was an issue loading setts. Try refreshing.</Typography>
      </div>
    );
  }

  const walletList: JSX.Element[] = [];
  const settList: JSX.Element[] = [];

  const accountedTokens = new Set<string>();
  network.settOrder.forEach((contract) => {
    const contractAddress = Web3.utils.toChecksumAddress(contract);
    const sett = currentSettMap[contractAddress];
    const badgerSett = network.setts.find((sett) => sett.vaultToken.address === contractAddress);

    if (!sett || !badgerSett) {
      return null;
    }

    const walletBalance = user.getBalance(BalanceNamespace.Token, badgerSett);
    const walletItem = createSettListItem(sett, walletBalance, currency);

    if (walletItem) {
      walletList.push(walletItem);
      accountedTokens.add(walletBalance.token.address);
    }

    const scalar = new BigNumber(sett.pricePerFullShare);
    const generalBalance = user.getBalance(BalanceNamespace.Sett, badgerSett).scale(scalar, true);
    const guardedBalance = user.getBalance(BalanceNamespace.GuardedSett, badgerSett).scale(scalar, true);
    const deprecatedBalance = user.getBalance(BalanceNamespace.Deprecated, badgerSett).scale(scalar, true);
    const settBalance = generalBalance ?? guardedBalance ?? deprecatedBalance;
    const settItem = createSettListItem(sett, settBalance, currency);

    if (settItem) {
      settList.push(settItem);
      accountedTokens.add(settBalance.token.address);
    }
  });

  setts.protocolTokens.forEach((token) => {
    if (accountedTokens.has(token)) {
      return;
    }
    const walletBalance = user.getTokenBalance(token);
    const tokenInfo = setts.getToken(token);
    const mockSett = {
      name: tokenInfo.name,
      state: VaultState.Open,
      vaultToken: tokenInfo.address,
      vaultAsset: tokenInfo.symbol,
      sources: [] as ValueSource[],
      bouncer: BouncerType.None,
    };
    const walletItem = createSettListItem(mockSett as Vault, walletBalance, currency);
    if (walletItem) {
      walletList.push(walletItem);
    }
  });

  const displayWallet = walletList.length > 0;
  const displayDeposit = settList.length > 0;

  return (
    <>
      {displayWallet && (
        <div className={classes.tableContainer}>
          <SettTable
            title={'Your Wallet:'}
            displayValue={inCurrency(user.walletValue, currency)}
            settList={walletList}
          />
        </div>
      )}
      {displayDeposit && (
        <div className={classes.tableContainer}>
          <SettTable
            title={'Your Vault Deposits:'}
            displayValue={inCurrency(user.settValue, currency)}
            settList={settList}
          />
        </div>
      )}
      {!displayWallet && !displayDeposit && (
        <Typography className={classes.noDeposit} align="center" variant="subtitle1" color="textSecondary">
          Your address does not have tokens to deposit.
        </Typography>
      )}
    </>
  );
});

export default UserListDisplay;
