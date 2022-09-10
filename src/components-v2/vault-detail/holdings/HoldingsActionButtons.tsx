import { VaultDTOV3 } from '@badger-dao/sdk';
import { Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StrategyConfig } from 'mobx/model/strategies/strategy-config';
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
  goToLink: {
    width: '100%',
  },
}));

interface Props {
  vault: VaultDTOV3;
  onDepositClick: () => void;
  onWithdrawClick: () => void;
  isUserHasToken: boolean;
  strategy: StrategyConfig;
  isUserHasDeposit: boolean;
}

export const HoldingsActionButtons = ({
  vault,
  onDepositClick,
  onWithdrawClick,
  isUserHasToken,
  strategy,
  isUserHasDeposit,
}: Props): JSX.Element => {
  const { vaults, wallet } = React.useContext(StoreContext);
  const canUserDeposit = wallet.isConnected ? vaults.canUserDeposit(vault) : false;
  const canUserWithdraw = vaults.canUserWithdraw(vault);
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {isUserHasDeposit && (
        <>
          {isUserHasToken ? (
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
          ) : (
            <Link href={strategy.depositLink} target="_blank" className={classes.goToLink} underline="none">
              <VaultActionButton variant="contained" fullWidth color="primary">
                Go to {vault.protocol}
              </VaultActionButton>
            </Link>
          )}
        </>
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
