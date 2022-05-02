import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ArrowDropDown } from '@material-ui/icons';
import { Button, Popper, Paper, List, ListItem, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';
import { supportedNetworks } from 'config/networks.config';
import { Network } from 'mobx/model/network/network';
import { Network as ChainNetworkSymbol, getNetworkConfig } from '@badger-dao/sdk';
import clsx from 'clsx';

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
};

interface Props {
	className?: HTMLButtonElement['className'];
}

const NetworkWidget = observer(({ className }: Props) => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const { network } = store;
	const connectedNetwork = network.network;

	// anchorEl is the Popper reference object prop
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: any) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	const optionClicked = async (option: string) => {
		const networkConfig = getNetworkConfig(option);
		try {
			await network.setNetwork(networkConfig.chainId);
		} catch (e) {
			console.error(e);
		}
		setAnchorEl(null);
	};

	const options = Object.values(supportedNetworks).filter(
		(network: Network) => network.symbol !== connectedNetwork.symbol,
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
				<NetworkOption network={connectedNetwork} />
			</Button>
			<Popper style={{ zIndex: 100000 }} placement="bottom-end" id={'popper'} open={open} anchorEl={anchorEl}>
				<Paper onMouseLeave={() => setAnchorEl(null)}>
					<List>
						{options.map((network) => {
							return (
								<ListItem
									className={classes.listItem}
									button
									onClick={async () => await optionClicked(network.symbol)}
									key={network.symbol}
								>
									<NetworkOption network={network} />
								</ListItem>
							);
						})}
					</List>
				</Paper>
			</Popper>
		</>
	);
});

const NetworkOption = (props: { network: Network }) => {
	const classes = useStyles();
	const displayName = networkAbbreviationBySymbol[props.network.symbol];

	return (
		<div className={classes.networkOption}>
			<Typography variant="body1" component="div">
				{displayName}
			</Typography>
		</div>
	);
};

export default NetworkWidget;
