import { makeStyles } from '@material-ui/core';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';

const useStyles = makeStyles((theme) => ({
  notificationContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.secondary.main,
    fontSize: '1.05rem',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    color: theme.palette.error.main,
    borderBottom: '1px solid',
  },
  notificationLink: {
    color: theme.palette.primary.main,
    fontSize: '.90rem',
  },
}));

const NetworkNotification = observer((): JSX.Element | null => {
  const { network: networkStore } = useContext(StoreContext);
  const classes = useStyles();

  const network = Chain.getChain(networkStore.network);

  if (!network || !network.notification) {
    return null;
  }
  return (
    <div className={classes.notificationContainer}>
      <span>{network.notification}</span>
      {network.notificationLink && (
        <a
          href={network.notificationLink}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.notificationLink}
        >
          Read More
        </a>
      )}
    </div>
  );
});

export default NetworkNotification;
