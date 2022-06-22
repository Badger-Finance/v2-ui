import { VaultDTO } from '@badger-dao/sdk';
import { makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  vaultDescription: {
    marginBottom: theme.spacing(1),
  },
  link: {
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
  },
  openIcon: {
    fontSize: 12,
    marginLeft: 4,
  },
}));

interface Props {
  vault: VaultDTO;
}

export const Footer = observer(({ vault }: Props): JSX.Element => {
  const store = React.useContext(StoreContext);
  const { network: networkStore } = store;
  const { network } = networkStore;
  const classes = useStyles();

  const strategy = network.strategies[vault.vaultToken];

  return (
    <footer>
      {strategy.description && (
        <div className={classes.vaultDescription}>
          <Typography variant="body2" color="textSecondary">
            {strategy.description}
          </Typography>
        </div>
      )}
    </footer>
  );
});
