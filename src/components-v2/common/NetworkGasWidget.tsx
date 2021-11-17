import React, { useContext, useState } from 'react';
import {
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Typography,
	ListItem,
	List,
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
	title: {
		padding: theme.spacing(3, 3, 0, 3),
	},
	content: {
		padding: theme.spacing(2, 3, 3, 3),
	},
	closeButton: {
		position: 'absolute',
		right: 8,
		top: 8,
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
		border: `2px solid ${theme.palette.primary.main}`,
		color: theme.palette.primary.main,
	},
	nonSelectedOption: {
		border: '2px solid #848484',
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
		borderRadius: 8,
	},
	confirmButton: {
		marginTop: theme.spacing(4),
	},
	gasSection: {
		marginTop: theme.spacing(2),
	},
	gasList: {
		marginTop: theme.spacing(1),
	},
	networkOption: {
		marginTop: theme.spacing(1),
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
			<Dialog open={isDialogOpen} fullWidth maxWidth="sm">
				<DialogTitle className={classes.title}>
					Network & Gas
					<IconButton className={classes.closeButton} onClick={toggleDialog}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent className={classes.content}>
					<Grid container>
						<Grid item container direction="column">
							<Typography variant="subtitle1" color="textSecondary">
								NETWORK
							</Typography>
							<List disablePadding>
								{supportedNetworks.map((supportedNetwork, index) => (
									<ListItem
										button
										className={clsx(
											classes.option,
											classes.networkOption,
											getOptionClassName(supportedNetwork.symbol === selectedNetwork.symbol),
										)}
										key={`${supportedNetwork.name}-${index}`}
										onClick={() => setSelectedNetwork(supportedNetwork)}
									>
										<img
											className={classes.networkListIcon}
											src={`/assets/icons/${networkIcons[supportedNetwork.symbol]}`}
											alt={`${supportedNetwork.name} icon`}
										/>
										<Typography variant="subtitle1">{supportedNetwork.name}</Typography>
									</ListItem>
								))}
							</List>
						</Grid>
						<Grid item container className={classes.gasSection}>
							<Typography variant="subtitle1" color="textSecondary">
								GAS
							</Typography>
							{gasPrices.initialized && gasOptions ? (
								<Grid container spacing={1} className={classes.gasList}>
									{Object.entries(gasOptions).map((price) => {
										const [key, value] = price;
										const displayValue = typeof value === 'number' ? value : value.maxFeePerGas;
										return (
											<Grid item key={key}>
												<Button
													onClick={() => setSelectedGas(key as GasSpeed)}
													className={clsx(
														classes.option,
														getOptionClassName(selectedGas === key),
													)}
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
