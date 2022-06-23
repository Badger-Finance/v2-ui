import { VaultState } from '@badger-dao/sdk';
import {
  makeStyles,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { Loader } from 'components/Loader';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

import NoVaults from './NoVaults';
import VaultList from './VaultList';
import VaultListItem from './VaultListItem';
import VaultListItemMobile from './VaultListItemMobile';

const useStyles = makeStyles((theme) => ({
  messageContainer: {
    paddingTop: theme.spacing(4),
    textAlign: 'center',
  },
}));

const VaultListDisplay = observer(() => {
  const classes = useStyles();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  const store = useContext(StoreContext);
  const {
    vaults,
    network: { network },
    user,
  } = store;

  const { initialized, vaultOrder } = vaults;
  const showDeprecated = vaults.vaultsFilters.statuses?.includes(
    VaultState.Discontinued,
  );

  if (!initialized) {
    return <Loader message={`Loading ${network.name} Setts...`} />;
  }

  if (vaultOrder === null) {
    return (
      <div className={classes.messageContainer}>
        <Typography variant="h4">
          There was an issue loading setts. Try refreshing.
        </Typography>
      </div>
    );
  }

  const settListItems = vaultOrder.flatMap((vault) => {
    const hasNoBalance = user.getBalance(vault.vaultToken).tokenBalance.eq(0);

    // Hide the remBadger vault from users who do not have rembadger (this default hides the sett)
    if (
      vault.vaultToken === ETH_DEPLOY.sett_system.vaults['native.rembadger'] &&
      hasNoBalance
    ) {
      return [];
    }

    // Hide deprecated vaults that the user is not deposited into
    if (
      !showDeprecated &&
      vault.state === VaultState.Discontinued &&
      hasNoBalance
    ) {
      return [];
    }

    if (isMobile) {
      return <VaultListItemMobile key={vault.vaultToken} vault={vault} />;
    }

    return <VaultListItem vault={vault} key={vault.vaultToken} />;
  });

  if (settListItems.length === 0 && vaults.vaultsFiltersCount === 0) {
    return <NoVaults network={network.name} />;
  }

  return <VaultList settList={settListItems} />;
});

export default VaultListDisplay;
