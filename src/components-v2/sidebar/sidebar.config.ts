import { Network, NetworkConfig } from '@badger-dao/sdk';
import { FLAGS } from 'config/environment';
import { isSupportedNetwork } from 'config/wallets';
import { SidebarConfig } from './interface/sidebar-config.interface';

const sidebarConfig: Record<Network, SidebarConfig> = {
	[Network.Local]: {
		cycle: true,
		digg: true,
		ibBTC: true,
		bridge: true,
		boost: true,
		airdrops: true,
		honey: true,
		auction: true,
	},
	[Network.Ethereum]: {
		cycle: true,
		digg: true,
		ibBTC: true,
		bridge: true,
		boost: true,
		airdrops: true,
		honey: true,
		auction: FLAGS.CITADEL_SALE,
	},
	[Network.Arbitrum]: {
		cycle: true,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: true,
		airdrops: false,
		honey: false,
		auction: false,
	},
	[Network.Avalanche]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		airdrops: false,
		honey: false,
		auction: false,
	},
	[Network.BinanceSmartChain]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		airdrops: false,
		honey: false,
		auction: false,
	},
	[Network.Polygon]: {
		cycle: true,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		airdrops: false,
		honey: false,
		auction: false,
	},
	[Network.Fantom]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		airdrops: false,
		honey: false,
		auction: false,
	},
	[Network.xDai]: {
		cycle: false,
		digg: false,
		ibBTC: false,
		bridge: false,
		boost: false,
		airdrops: false,
		honey: false,
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
