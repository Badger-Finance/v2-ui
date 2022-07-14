import { VaultDTO } from '@badger-dao/sdk';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { StyledDivider } from '../styled';
import VaultDetailLink from './VaultDetailLink';

const useStyles = makeStyles((theme) => ({
  showMoreContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    cursor: 'pointer',
  },
  showMore: {
    color: theme.palette.primary.main,
    fontSize: 12,
    padding: theme.spacing(0.2),
  },
  linksContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

interface Props {
  vault: VaultDTO;
}

const VaultDetailLinks = observer(({ vault }: Props): JSX.Element => {
  const { chain: networkStore } = React.useContext(StoreContext);
  const { network, config } = networkStore;
  const classes = useStyles();

  const { vaultToken, underlyingToken } = vault;
  const strategy = Chain.getChain(network).strategies[vaultToken];
  const strategyAddress = vault.strategy.address;

  return (
    <Grid container className={classes.linksContainer}>
      <Typography>Links</Typography>
      <StyledDivider />
      {strategy && (
        <>
          {strategy.userGuide && <VaultDetailLink title="User Guide" href={strategy.userGuide} />}
          {strategy.strategyLink && <VaultDetailLink title="Strategy Diagram" href={strategy.strategyLink} />}
          {strategy.depositLink && <VaultDetailLink title="Get Deposit Token" href={strategy.depositLink} />}
        </>
      )}
      <VaultDetailLink title="Vault Address" href={`${config.explorerUrl}/address/${vaultToken}`} />
      <VaultDetailLink title="Strategy Address" href={`${config.explorerUrl}/address/${strategyAddress}`} />
      <VaultDetailLink title="Underlying Token Address" href={`${config.explorerUrl}/address/${underlyingToken}`} />
      <VaultDetailLink
        title="Ninja Analytics"
        href={`https://badger-ninja.vercel.app/vault/${network}/${vaultToken}`}
      />
    </Grid>
  );
});

export default VaultDetailLinks;
