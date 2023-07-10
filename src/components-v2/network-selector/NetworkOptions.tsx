import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

import { supportedNetworks } from '../../config/networks.config';
import Menu from '../../ui-library/Menu';
import MenuSubheader from '../../ui-library/MenuSubheader';
import NetworkOption from './NetworkOption';

const useStyles = makeStyles((theme) => ({
  networkListIcon: {
    width: 17,
    height: 17,
    marginRight: theme.spacing(1),
  },
  root: {
    minWidth: 234,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },
  active: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}));

interface Props {
  onSelect: () => void;
}

const NetworkOptions = ({ onSelect }: Props): JSX.Element => {
  const classes = useStyles();
  return (
    <Menu
      role="presentation"
      disablePadding
      className={classes.root}
      subheader={<MenuSubheader>NETWORK</MenuSubheader>}
      onMouseLeave={() => onSelect()}
    >
      {supportedNetworks.map((chain) => (
        <NetworkOption key={chain.network} chain={chain} onSelect={onSelect} />
      ))}
    </Menu>
  );
};

export default NetworkOptions;
