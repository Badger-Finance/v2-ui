import { VaultDTO } from '@badger-dao/sdk';
import { Card, Grid, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { MouseEvent, useContext } from 'react';

import { useVaultInformation } from '../../hooks/useVaultInformation';
import CurrencyDisplay from '../common/CurrencyDisplay';
import VaultListItemTags from '../VaultListItemTags';
import VaultItemApr from './VaultItemApr';
import VaultLogo from './VaultLogo';

const useStyles = makeStyles(() => ({
  root: {
    padding: '16px 20px',
    marginBottom: 10,
  },
  info: {
    margin: '26px 0px',
  },
  name: {
    marginLeft: 8,
  },
}));

interface Props {
  vault: VaultDTO;
}

const VaultListItemMobile = ({ vault }: Props): JSX.Element => {
  const classes = useStyles();
  const { vaults } = useContext(StoreContext);
  const { vaultBoost, depositBalanceDisplay } = useVaultInformation(vault);

  const goToVaultDetail = async () => {
    await vaults.navigateToVaultDetail(vault);
  };

  const handleStatusClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    vaults.openStatusInformationPanel();
  };

  const handleRewardsClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    vaults.openRewardsInformationPanel();
  };

  return (
    <Grid container direction="column" component={Card} onClick={goToVaultDetail} className={classes.root}>
      <Grid item container>
        <VaultLogo tokens={vault.tokens} />
        <Typography variant="subtitle1" display="inline" className={classes.name}>
          {vault.name}
        </Typography>
      </Grid>
      <Grid item container className={classes.info}>
        <Grid item xs container direction="column">
          <Typography>{vaults.vaultsFilters.showAPR ? 'APR' : 'APY'}</Typography>
          <VaultItemApr vault={vault} boost={vaultBoost} />
        </Grid>
        <Grid item xs container direction="column">
          <Typography>My Deposits</Typography>
          <CurrencyDisplay displayValue={depositBalanceDisplay} variant="body1" justifyContent="flex-start" />
        </Grid>
      </Grid>
      <Grid item>
        <VaultListItemTags
          vault={vault}
          spacing={1}
          onStatusClick={handleStatusClick}
          onRewardsClick={handleRewardsClick}
        />
      </Grid>
    </Grid>
  );
};

export default observer(VaultListItemMobile);
