import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ArrowDropDown } from '@material-ui/icons';
import { Button, Popper, Paper, List, ListItem, makeStyles, Typography } from '@material-ui/core';
import { StoreContext } from 'mobx/store-context';
import { supportedNetworks } from 'config/networks.config';
import { Network } from 'mobx/model/network/network';

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
}));

const NetworkWidget = observer(() => {
	const classes = useStyles();
	const store = useContext(StoreContext);
	const {
		wallet: { connectedAddress },
		network,
	} = store;
	const connectedNetwork = network.network.symbol;

	// anchorEl is the Popper reference object prop
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleClick = (event: any) => {
		if (connectedAddress) {
			return;
		}
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	const optionClicked = async (option: string) => {
		await network.setNetwork(option);
		setAnchorEl(null);
	};

	const options = Object.values(supportedNetworks).filter((network: Network) => network.symbol !== connectedNetwork);
	return (
		<>
			<Button
				size="small"
				variant="outlined"
				endIcon={connectedAddress ? <></> : <ArrowDropDown />}
				onClick={handleClick}
				className={classes.selectButton}
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
									<NetworkOption network={network.symbol} />
								</ListItem>
							);
						})}
					</List>
				</Paper>
			</Popper>
		</>
	);
});

const NetworkOption = (props: { network: string }) => {
	return (
		<div style={{ alignItems: 'center', display: 'flex' }}>
			<Typography variant="body1" component="div">
				{props.network}
			</Typography>
		</div>
	);
};

export default NetworkWidget;
