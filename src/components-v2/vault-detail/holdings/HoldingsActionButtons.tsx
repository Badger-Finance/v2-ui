import { VaultDTOV3 } from '@badger-dao/sdk';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import React from 'react';

import { VaultActionButton } from '../../common/VaultActionButtons';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
  deposit: {
    marginRight: theme.spacing(1),
  },
  withdraw: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  vault: VaultDTOV3;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const HoldingsActionButtons = ({ vault, onDepositClick, onWithdrawClick }: Props): JSX.Element => {
  const { vaults, wallet } = React.useContext(StoreContext);
  const canUserDeposit = wallet.isConnected ? vaults.canUserDeposit(vault) : false;
  const canUserWithdraw = vaults.canUserWithdraw(vault);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {canUserDeposit && (
        <VaultActionButton
          fullWidth
          className={classes.deposit}
          color="primary"
          variant={canUserDeposit ? 'contained' : 'outlined'}
          disabled={!canUserDeposit}
          onClick={onDepositClick}
        >
          Deposit
        </VaultActionButton>
      )}
      <VaultActionButton
        className={classes.withdraw}
        fullWidth
        color="primary"
        variant="outlined"
        disabled={!canUserWithdraw}
        onClick={onWithdrawClick}
      >
        Withdraw
      </VaultActionButton>
    </div>
  );
};
