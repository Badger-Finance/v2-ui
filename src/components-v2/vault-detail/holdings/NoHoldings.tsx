import { VaultDTOV3 } from '@badger-dao/sdk';
import { Grid, Link, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { VaultActionButton } from '../../common/VaultActionButtons';
import DepositInfo from './DepositInfo';
import { StrategyConfig } from 'mobx/model/strategies/strategy-config';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  depositContainer: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      paddingLeft: theme.spacing(4),
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
      justifyContent: 'center',
    },
  },
  goToLink: {
    width: '100%',
  },
}));

interface Props {
  vault: VaultDTOV3;
  onDepositClick: () => void;
  isUserHasToken: boolean;
  strategy: StrategyConfig;
  isUserHasDeposit: boolean;
}

export const NoHoldings = observer(
  ({ vault, onDepositClick, isUserHasToken, strategy, isUserHasDeposit }: Props): JSX.Element | null => {
    const classes = useStyles();

    const store = React.useContext(StoreContext);
    const { user } = store;

    if (!user.onGuestList(vault)) {
      return null;
    }

    return (
      <Grid container className={classes.root} component={Paper}>
        <Grid item xs={12} sm={8}>
          <Typography variant="body1">{`You have no ${vault.name} in your connected wallet.`}</Typography>
          <DepositInfo strategy={strategy} />
        </Grid>
        <Grid item xs={12} sm className={classes.depositContainer}>
          {isUserHasToken ? (
            <VaultActionButton color="primary" variant="contained" fullWidth onClick={onDepositClick}>
              Deposit
            </VaultActionButton>
          ) : (
            <Link href={strategy.depositLink} target="_blank" className={classes.goToLink} underline="none">
              <VaultActionButton variant="contained" fullWidth color="primary">
                Go to {vault.protocol}
              </VaultActionButton>
            </Link>
          )}
        </Grid>
      </Grid>
    );
  },
);
