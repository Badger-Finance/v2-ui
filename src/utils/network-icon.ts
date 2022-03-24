import { Network } from '@badger-dao/sdk';

const networkIcons: Record<Network, string> = {
	[Network.Local]: 'ethereum-network.svg',
	[Network.Ethereum]: 'ethereum-network.svg',
	[Network.BinanceSmartChain]: 'bsc-network.svg',
	[Network.Arbitrum]: 'arbitrum-network.svg',
	[Network.Polygon]: 'matic-network.svg',
	[Network.xDai]: 'xdai-network.svg',
	[Network.Avalanche]: 'avalanche-network.svg',
	[Network.Fantom]: 'fantom-network.svg',
};

export function getNetworkIconPath(network: Network): string {
	return `/assets/icons/${networkIcons[network]}`;
}
