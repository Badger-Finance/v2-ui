import { VaultDTOV3 } from '@badger-dao/sdk';
import { Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StrategyConfig } from 'mobx/model/strategies/strategy-config';
import { StoreContext } from 'mobx/stores/store-context';
import React from 'react';
import { VaultActionButton } from '../../common/VaultActionButtons';
import { getGoToText } from '../utils';

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
  userHasToken: boolean;
  strategy: StrategyConfig;
  userHasDeposit: boolean;
}

export const HoldingsActionButtons = ({
  vault,
  onDepositClick,
  onWithdrawClick,
  userHasToken,
  strategy,
  userHasDeposit,
}: Props): JSX.Element => {
  const { vaults, wallet } = React.useContext(StoreContext);
  const canUserDeposit = wallet.isConnected ? vaults.canUserDeposit(vault) : false;
  const canUserWithdraw = vaults.canUserWithdraw(vault);
  const classes = useStyles();

  const DepositButton = () => (
    <VaultActionButton
      fullWidth
      className={classes.deposit}
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
      {userHasDeposit && (
        <>
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
