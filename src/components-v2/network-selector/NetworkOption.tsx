import React, { useContext, useRef, useState } from 'react';
import { NETWORK_IDS } from '../../config/constants';
import MenuItemIcon from '../../ui-library/MenuItemIcon';
import { getNetworkIconPath } from '../../utils/network-icon';
import MenuItemText from '../../ui-library/MenuItemText';
import { makeStyles } from '@material-ui/core/styles';
import { Network } from '../../mobx/model/network/network';
import { Grid, IconButton, Popper, useMediaQuery, useTheme } from '@material-ui/core';
import GasOptions from './GasOptions';
import { observer } from 'mobx-react-lite';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';
import { StoreContext } from '../../mobx/store-context';
import MenuItem from 'ui-library/MenuItem';

const useStyles = makeStyles((theme) => ({
	networkListIcon: {
		width: 17,
		height: 17,
		marginRight: theme.spacing(1),
	},
	root: {
		minWidth: 234,
	},
	popper: {
		zIndex: 2,
	},
	gasButton: {
		[theme.breakpoints.up('lg')]: {
			'&:hover': {
				backgroundColor: 'inherit',
			},
		},
	},
}));

interface Props {
	network: Network;
	onSelect: () => void;
}

const NetworkOption = ({ network, onSelect }: Props): JSX.Element => {
	const { network: networkStore, gasPrices } = useContext(StoreContext);
	const [open, setOpen] = useState(false);
	const classes = useStyles();
	const ref = useRef<HTMLImageElement | null>(null);
	const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));

	const isEthereum = network.id === NETWORK_IDS.ETH;
	const isCurrentNetwork = networkStore.network.symbol === network.symbol;
	const showGasOptions = gasPrices.initialized && isEthereum && isCurrentNetwork;

	const toggleOpen = () => {
		setOpen(!open);
	};

	const handleClick = async () => {
		const shouldTriggerNetworkChange = networkStore.network.symbol !== network.symbol;

		if (shouldTriggerNetworkChange) {
			const networkConfig = NetworkConfig.getConfig(network.symbol);
			await networkStore.setNetwork(networkConfig.id);
		}

		onSelect();
	};

	return (
		<MenuItem
			// in desktop the whole section can be clickable because the gas options are revealed on hover but in mobile
			// there is no hover, that's why we constrain the clickable section to only the network icon and name
			// the arrow icon is used to reveal the gas options
			button={!isMobile}
			onClick={!isMobile ? handleClick : undefined}
			onMouseEnter={!isMobile ? toggleOpen : undefined}
			onMouseLeave={!isMobile ? toggleOpen : undefined}
		>
			<Grid container>
				<Grid item xs container alignItems="center" onClick={isMobile ? handleClick : undefined}>
					<MenuItemIcon>
						<img
							className={classes.networkListIcon}
							src={getNetworkIconPath(network.symbol)}
							alt={`${network.name} icon`}
						/>
					</MenuItemIcon>
					<MenuItemText>{network.name}</MenuItemText>
				</Grid>
				{showGasOptions && (
					<Grid item xs="auto">
						<IconButton
							className={classes.gasButton}
							onClick={isMobile ? toggleOpen : undefined}
							aria-label="show gas options"
						>
							<img
								ref={ref}
								src="/assets/icons/network-selector-arrow.svg"
								alt="display gas options icon"
							/>
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
							<GasOptions network={network} onSelect={onSelect} />
						</Popper>
					</Grid>
				)}
			</Grid>
		</MenuItem>
	);
};

export default observer(NetworkOption);
