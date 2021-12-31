import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
  ListItem,
  List,
  Box,
  Dialog,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { GasSpeed, Network, NetworkConfig } from '@badger-dao/sdk';
import CloseIcon from '@material-ui/icons/Close';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { defaultNetwork, supportedNetworks } from '../../config/networks.config';
import { StoreContext } from '../../mobx/store-context';
import { Loader } from '../../components/Loader';

const useStyles = makeStyles((theme) => ({
  dialog: {
    maxWidth: 343,
  },
  title: {
    padding: theme.spacing(3, 3, 0, 3),
  },
  titleText: {
    fontWeight: 700,
  },
  content: {
    padding: theme.spacing(2, 3, 3, 3),
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 16,
  },
  networkButton: {
    minWidth: 37,
    height: 36,
    textAlign: 'center',
  },
  loadingGas: {
    textAlign: 'center',
    width: '33%',
  },
  selectedOption: {
    border: `1px solid ${theme.palette.primary.main}`,
    '& p': {
      fontWeight: 700,
    },
    '& span': {
      fontWeight: 700,
    },
  },
  nonSelectedOption: {
    border: '1px solid transparent', // avoids content jumping caused by the 1px border only rendering for selected options
  },
  networkListIcon: {
    width: 17,
    height: 17,
    marginRight: theme.spacing(1),
  },
  selectedNetworkItem: {
    width: 17,
    height: 17,
  },
  selectedNetworkIcon: {
    width: 17,
    height: 17,
  },
  option: {
    backgroundColor: '#121212',
    borderRadius: 8,
  },
  confirmButton: {
    marginTop: theme.spacing(7),
    height: 50,
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(4),
    },
  },
  gasSection: {
    marginTop: theme.spacing(6),
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
    },
  },
  gasList: {
    marginTop: theme.spacing(1),
  },
  networkOption: {
    marginTop: theme.spacing(1),
    height: 50,
  },
  buttonLabel: {
    fontWeight: 400,
  },
  gasOption: {
    minWidth: 60,
    maxWidth: 60,
    height: 50,
  },
}));

const networkIcons: Record<Network, string> = {
  [Network.Ethereum]: 'ethereum-network.svg',
  [Network.BinanceSmartChain]: 'bsc-network.svg',
  [Network.Arbitrum]: 'arbitrum-network.svg',
  [Network.Polygon]: 'matic-network.svg',
  [Network.xDai]: 'xdai-network.svg',
  [Network.Avalanche]: 'avalanche-network.svg',
  [Network.Fantom]: 'fantom-network.svg',
};

const NetworkGasWidget = (): JSX.Element => {
  const {
    gasPrices,
    uiState: { gasPrice, setGasPrice },
    network: networkStore,
  } = useContext(StoreContext);

  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetwork);
  const [selectedGas, setSelectedGas] = useState(gasPrice);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const classes = useStyles();

  const gasOptions = gasPrices.getGasPrices(selectedNetwork.symbol);
  const { network } = networkStore;

  const toggleDialog = () => setIsDialogOpen(!isDialogOpen);

  const getOptionClassName = (selected: boolean) => (selected ? classes.selectedOption : classes.nonSelectedOption);

  const applyChanges = async () => {
    const shouldTriggerNetworkChange = selectedNetwork.symbol !== network.symbol;

    if (shouldTriggerNetworkChange) {
      const networkConfig = NetworkConfig.getConfig(selectedNetwork.symbol);
      await networkStore.setNetwork(networkConfig.id);
    }

    setGasPrice(selectedGas);
    setIsDialogOpen(false);
  };

  useEffect(() => {
    setSelectedNetwork(network);
  }, [network]);

  return (
    <>
      <Button
        classes={{ outlined: isDialogOpen ? classes.selectedOption : undefined }}
        className={classes.networkButton}
        variant="outlined"
        onClick={toggleDialog}
      >
        <img
          className={classes.selectedNetworkIcon}
          src={`/assets/icons/${networkIcons[network.symbol]}`}
          alt="selected network icon"
        />
      </Button>
      <Dialog classes={{ paperWidthSm: classes.dialog }} open={isDialogOpen} fullWidth maxWidth="sm">
        <DialogTitle className={classes.title}>
          <Typography className={classes.titleText} variant="h6">
            Network & Gas
          </Typography>
          <IconButton className={classes.closeButton} onClick={toggleDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.content}>
          <Grid container>
            <Grid item container direction="column">
              <Typography variant="body2" color="textSecondary">
                NETWORK
              </Typography>
              <List disablePadding>
                {supportedNetworks.map((networkOption, index) => (
                  <ListItem
                    button
                    className={clsx(
                      classes.option,
                      classes.networkOption,
                      getOptionClassName(networkOption.symbol === selectedNetwork.symbol),
                    )}
                    key={`${networkOption.name}-${index}`}
                    onClick={() => setSelectedNetwork(networkOption)}
                  >
                    <Box width="100%" display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="body2">{networkOption.name}</Typography>
                      <img
                        className={classes.networkListIcon}
                        src={`/assets/icons/${networkIcons[networkOption.symbol]}`}
                        alt={`${networkOption.name} icon`}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item container className={classes.gasSection}>
              <Typography variant="body2" color="textSecondary">
                GAS
              </Typography>
              {gasPrices.initialized && gasOptions ? (
                <Grid container spacing={2} className={classes.gasList}>
                  {Object.entries(gasOptions).map((price) => {
                    const [key, value] = price;
                    const displayValue = typeof value === 'number' ? value : value.maxFeePerGas;
                    return (
                      <Grid item key={key}>
                        <Button
                          onClick={() => setSelectedGas(key as GasSpeed)}
                          classes={{ label: classes.buttonLabel }}
                          className={clsx(classes.option, classes.gasOption, getOptionClassName(selectedGas === key))}
                        >
                          {displayValue ? displayValue.toFixed(0) : 10}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Grid container direction="column" className={classes.loadingGas}>
                  <Loader size={15} />
                  <Typography variant="caption">Loading Gas...</Typography>
                </Grid>
              )}
            </Grid>
            <Button
              fullWidth
              onClick={async () => await applyChanges()}
              className={classes.confirmButton}
              variant="contained"
              color="primary"
            >
              Confirm Network
            </Button>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default observer(NetworkGasWidget);
