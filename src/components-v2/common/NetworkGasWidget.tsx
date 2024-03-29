import { Box, Button, ClickAwayListener } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useRef } from 'react';

import { getNetworkIconPath } from '../../utils/network-icon';
import NetworkOptions from '../network-selector/NetworkOptions';

const useStyles = makeStyles({
  networkButton: {
    minWidth: 37,
    textAlign: 'center',
    padding: 0,
  },
  selectedNetworkIcon: {
    width: 17,
    height: 17,
  },
  popover: {
    zIndex: 110,
  },
});

const NetworkGasWidget = (): JSX.Element => {
  const classes = useStyles();
  const {
    chain: networkStore,
    uiState: { areNetworkOptionsOpen, openNetworkOptions, closeNetworkOptions },
  } = useContext(StoreContext);
  const ref = useRef<HTMLButtonElement | null>(null);
  return (
    <ClickAwayListener
      onClickAway={(e: React.MouseEvent<Document>) => {
        if ((e.target as HTMLElement)?.textContent?.toLowerCase() !== 'switch networks') {
          closeNetworkOptions();
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Button
          ref={ref}
          className={classes.networkButton}
          variant="outlined"
          color="primary"
          onClick={openNetworkOptions}
          aria-label="open network selector"
        >
          <img
            className={classes.selectedNetworkIcon}
            src={getNetworkIconPath(networkStore.network)}
            alt="selected network icon"
            width="17"
            height="17"
          />
        </Button>

        {areNetworkOptionsOpen && <NetworkOptions onSelect={closeNetworkOptions} />}
      </Box>
    </ClickAwayListener>
  );
};

export default observer(NetworkGasWidget);
