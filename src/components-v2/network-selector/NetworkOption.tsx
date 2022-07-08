import { GasFees, getNetworkConfig } from '@badger-dao/sdk';
import { Grid, IconButton, Popper, useMediaQuery, useTheme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useRef, useState } from 'react';
import MenuItem from 'ui-library/MenuItem';

import { Chain } from '../../mobx/model/network/chain';
import MenuItemIcon from '../../ui-library/MenuItemIcon';
import MenuItemText from '../../ui-library/MenuItemText';
import { getNetworkIconPath } from '../../utils/network-icon';
import GasOptions from './GasOptions';

const useStyles = makeStyles((theme) => ({
  networkListIcon: {
    width: 17,
    height: 17,
    marginRight: theme.spacing(1),
  },
  hoveredButton: {
    backgroundColor: '#545454',
  },
  root: {
    minWidth: 234,
  },
  popper: {
    zIndex: 120,
  },
  gasButton: {
    marginRight: -12,
    [theme.breakpoints.up('lg')]: {
      '&:hover': {
        backgroundColor: 'inherit',
      },
    },
  },
}));

interface Props {
  network: Chain;
  onSelect: () => void;
}

const NetworkOption = ({ network, onSelect }: Props): JSX.Element => {
  const { network: networkStore, gasPrices } = useContext(StoreContext);
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const ref = useRef<HTMLImageElement | null>(null);
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  const gasOptions = gasPrices.getGasPrices(network.symbol);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleNetworkSelection = async () => {
    const shouldTriggerNetworkChange = Chain.getChain(networkStore.network).symbol !== network.symbol;

    if (shouldTriggerNetworkChange) {
      const networkConfig = getNetworkConfig(network.symbol);
      try {
        await networkStore.setNetwork(networkConfig.chainId);
      } catch (e) {
        console.error(e);
      }
    }

    onSelect();
  };

  const handleGasSelection = async (gas: number | GasFees) => {
    networkStore.setGasPrice(gas);
    await handleNetworkSelection();
  };

  return (
    <MenuItem
      // in desktop the whole section can be clickable because the gas options are revealed on hover but in mobile
      // there is no hover, that's why we constrain the clickable section to only the network icon and name
      // the arrow icon is used to reveal the gas options
      button={!isMobile}
      onClick={!isMobile ? handleNetworkSelection : undefined}
      onMouseEnter={!isMobile ? toggleOpen : undefined}
      onMouseLeave={!isMobile ? toggleOpen : undefined}
      className={clsx(open && classes.hoveredButton)}
    >
      <Grid container>
        <Grid item xs container alignItems="center" onClick={isMobile ? handleNetworkSelection : undefined}>
          <MenuItemIcon>
            <img
              className={classes.networkListIcon}
              src={getNetworkIconPath(network.symbol)}
              alt={`${network.name} icon`}
            />
          </MenuItemIcon>
          <MenuItemText>{network.name}</MenuItemText>
        </Grid>
        {gasOptions && (
          <Grid item xs="auto">
            <IconButton
              className={classes.gasButton}
              onClick={isMobile ? toggleOpen : undefined}
              aria-label="show gas options"
            >
              <img ref={ref} src="/assets/icons/network-selector-arrow.svg" alt="display gas options icon" />
            </IconButton>
            <Popper
              className={classes.popper}
              anchorEl={ref.current}
              open={open}
              placement="right-start"
              modifiers={{
                flip: {
                  enabled: true,
                },
                preventOverflow: {
                  enabled: true,
                  boundariesElement: 'viewport',
                },
                offset: {
                  enabled: true,
                  offset: '-15px, 5px',
                },
              }}
            >
              <GasOptions gasOptions={gasOptions} onSelect={handleGasSelection} />
            </Popper>
          </Grid>
        )}
      </Grid>
    </MenuItem>
  );
};

export default observer(NetworkOption);
