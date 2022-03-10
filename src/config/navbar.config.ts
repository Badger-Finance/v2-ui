import { Network, NetworkConfig } from '@badger-dao/sdk';
import { FLAGS } from 'config/environment';
import { isSupportedNetwork } from 'config/wallets';
import { NavbarConfig } from './interfaces/navbar-config.interface';

const navbarConfig: Record<Network, NavbarConfig> = {
	[Network.Local]: {
		cycle: true,
		digg: true,
		ibBTC: true,
		bridge: false,
		boost: true,
		auction: true,
	},
	[Network.Ethereum]: {
		cycle: true,
		digg: true,
		ibBTC: true,
		bridge: false,
		boost: true,
		auction: FLAGS.CITADEL_SALE,
	},
	[Network.Arbitrum]: {
		cycle: true,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: true,
		auction: false,
	},
	[Network.Avalanche]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.BinanceSmartChain]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.Polygon]: {
		cycle: true,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.Fantom]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.xDai]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
};

export function getNavbarConfig(network?: Network): NavbarConfig {
	let chain = Network.Ethereum;
	try {
		const config = NetworkConfig.getConfig(network ?? chain);
		if (isSupportedNetwork(config.id)) {
			return navbarConfig[config.network];
		}
	} catch {} // ignore network not found error - defaults to ethereum
	return navbarConfig[chain];
}
