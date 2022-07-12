import { getNetworkConfig, Network as ChainNetworkSymbol } from '@badger-dao/sdk';
import { Button, List, ListItem, makeStyles, Paper, Popper, Typography } from '@material-ui/core';
import { ArrowDropDown } from '@material-ui/icons';
import clsx from 'clsx';
import { supportedNetworks } from 'config/networks.config';
import { Chain } from 'mobx/model/network/chain';
import { StoreContext } from 'mobx/stores/store-context';
import { observer } from 'mobx-react-lite';
import React, { useContext, useState } from 'react';

const useStyles = makeStyles((theme) => ({
  network: {
    marginRight: theme.spacing(1),
    pointerEvents: 'none',
  },
  selectButton: {
    textTransform: 'uppercase',
  },
  listItem: {
    textTransform: 'uppercase',
  },
  networkOption: {
    alignItems: 'center',
    display: 'flex',
  },
}));

const networkAbbreviationBySymbol: Record<ChainNetworkSymbol, string> = {
  [ChainNetworkSymbol.Local]: 'LOCAL',
  [ChainNetworkSymbol.Ethereum]: 'ETH',
  [ChainNetworkSymbol.BinanceSmartChain]: 'BSC',
  [ChainNetworkSymbol.Arbitrum]: 'ARBITRUM',
  [ChainNetworkSymbol.Polygon]: 'MATIC',
  [ChainNetworkSymbol.Avalanche]: 'AVALANCHE',
  [ChainNetworkSymbol.Fantom]: 'FANTOM',
  [ChainNetworkSymbol.Optimism]: 'OPTIMISM',
};

interface Props {
  className?: HTMLButtonElement['className'];
}

const NetworkWidget = observer(({ className }: Props) => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { chain } = store;
  const connectedNetwork = chain.config;

  // anchorEl is the Popper reference object prop
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const optionClicked = async (option: string) => {
    const networkConfig = getNetworkConfig(option);
    try {
      await chain.setNetwork(networkConfig.chainId);
    } catch (e) {
      console.error(e);
    }
    setAnchorEl(null);
  };

  const options = Object.values(supportedNetworks).filter(
    (chain: Chain) => chain.network !== connectedNetwork.currencySymbol,
  );

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<ArrowDropDown />}
        onClick={handleClick}
        className={clsx(classes.selectButton, className)}
      >
        <NetworkOption chain={Chain.getChain(chain.network)} />
      </Button>
      <Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
        <Paper onMouseLeave={() => setAnchorEl(null)}>
          <List>
            {options.map((network) => {
              return (
                <ListItem
                  className={classes.listItem}
                  button
                  onClick={async () => await optionClicked(chain.network)}
                  key={chain.network}
                >
                  <NetworkOption chain={network} />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Popper>
    </>
  );
});

const NetworkOption = (props: { chain: Chain }) => {
  const classes = useStyles();
  const displayName = networkAbbreviationBySymbol[props.chain.network];

  return (
    <div className={classes.networkOption}>
      <Typography variant="body1" component="div">
        {displayName}
      </Typography>
    </div>
  );
};

export default NetworkWidget;
