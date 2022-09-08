import { VaultDTOV3 } from '@badger-dao/sdk';
import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { VaultActionButton } from '../../common/VaultActionButtons';

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
}));

interface Props {
  vault: VaultDTOV3;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const MobileStickyActionButtons = observer(({ vault, onDepositClick, onWithdrawClick }: Props): JSX.Element => {
  const classes = useStyles();
  const { vaults, wallet } = React.useContext(StoreContext);
  const canUserDeposit = wallet.isConnected ? vaults.canUserDeposit(vault) : false;
  const canUserWithdraw = vaults.canUserWithdraw(vault);

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs>
          <VaultActionButton
            fullWidth
            color="primary"
            variant={canUserDeposit ? 'contained' : 'outlined'}
            disabled={!canUserDeposit}
            onClick={onDepositClick}
          >
            Deposit
          </VaultActionButton>
        </Grid>
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
      </Grid>
    </div>
  );
});
