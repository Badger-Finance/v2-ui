import { Network } from '@badger-dao/sdk';
import { FLAGS } from 'config/environment';
import { SidebarConfig } from './interface/sidebar-config.interface';

const sidebarConfig: Record<Network, SidebarConfig> = {
	[Network.Ethereum]: {
		cycle: true,
		digg: true,
		ibBTC: true,
		bridge: true,
		boost: true,
		experimental: true,
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
		experimental: true,
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
		experimental: true,
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
		experimental: true,
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
		experimental: true,
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
		experimental: true,
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
		experimental: true,
		airdrops: false,
		honey: false,
		auction: false,
	},
};

export function getSidebarConfig(network: Network): SidebarConfig {
	return sidebarConfig[network];
}
