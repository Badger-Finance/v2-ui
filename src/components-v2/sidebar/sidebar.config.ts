import { Network, NetworkConfig } from '@badger-dao/sdk';
import { FLAGS } from 'config/environment';
import { isSupportedNetwork } from 'config/wallets';
import { SidebarConfig } from './interface/sidebar-config.interface';

const sidebarConfig: Record<Network, SidebarConfig> = {
	[Network.Local]: {
		cycle: true,
		ibBTC: true,
		bridge: false,
		boost: true,
		auction: true,
	},
	[Network.Ethereum]: {
		cycle: true,
		ibBTC: true,
		bridge: false,
		boost: true,
		auction: FLAGS.CITADEL_SALE,
	},
	[Network.Arbitrum]: {
		cycle: true,
		ibBTC: false,
		bridge: false,
		boost: true,
		auction: false,
	},
	[Network.Avalanche]: {
		cycle: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.BinanceSmartChain]: {
		cycle: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.Polygon]: {
		cycle: true,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.Fantom]: {
		cycle: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
	[Network.xDai]: {
		cycle: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		auction: false,
	},
};

export function getSidebarConfig(network?: Network): SidebarConfig {
	let chain = Network.Ethereum;
	try {
		const config = NetworkConfig.getConfig(network ?? chain);
		if (isSupportedNetwork(config.id)) {
			return sidebarConfig[config.network];
		}
	} catch {} // ignore network not found error - defaults to ethereum
	return sidebarConfig[chain];
}
