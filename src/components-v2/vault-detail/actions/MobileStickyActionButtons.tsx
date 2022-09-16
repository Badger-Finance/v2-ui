import { VaultDTOV3 } from '@badger-dao/sdk';
import { Grid, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useVaultInformation } from 'hooks/useVaultInformation';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { VaultActionButton } from '../../common/VaultActionButtons';
import { getGoToText } from '../utils';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#181818',
    padding: theme.spacing(2),
    width: '100%',
    zIndex: 999,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  goToLink: {
    width: '100%',
  },
}));

interface Props {
  vault: VaultDTOV3;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const MobileStickyActionButtons = observer(({ vault, onDepositClick, onWithdrawClick }: Props): JSX.Element => {
  const classes = useStyles();
  const { vaults, wallet, user, chain: networkStore } = React.useContext(StoreContext);
  const canUserDeposit = wallet.isConnected ? vaults.canUserDeposit(vault) : false;
  const canUserWithdraw = vaults.canUserWithdraw(vault);
  const { depositBalance } = useVaultInformation(vault);
  const userHasToken = user.getBalance(vault.underlyingToken).hasBalance();
  const userHasDeposit = !depositBalance.tokenBalance.eq(0);
  const { network } = networkStore;
  const strategy = Chain.getChain(network).strategies[vault.vaultToken];

  const DepositButton = () => (
    <VaultActionButton
      fullWidth
      color="primary"
      variant={canUserDeposit && userHasToken ? 'contained' : 'outlined'}
      disabled={!userHasToken || !canUserDeposit}
      onClick={onDepositClick}
    >
      Deposit
    </VaultActionButton>
  );

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs>
          {userHasToken ? (
            <DepositButton />
          ) : (
            <>
              {strategy?.depositLink ? (
                <Link href={strategy.depositLink} target="_blank" className={classes.goToLink} underline="none">
                  <VaultActionButton variant="contained" fullWidth color="primary">
                    Go to {getGoToText(vault)}
                  </VaultActionButton>
                </Link>
              ) : (
                <DepositButton />
              )}
            </>
          )}
        </Grid>
        {userHasDeposit && (
          <Grid item xs>
            <VaultActionButton
              color="primary"
              variant="outlined"
              fullWidth
              disabled={!canUserWithdraw}
              onClick={onWithdrawClick}
            >
              Withdraw
            </VaultActionButton>
          </Grid>
        )}
      </Grid>
    </div>
  );
});
