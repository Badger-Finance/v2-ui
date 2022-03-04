import { Network } from '@badger-dao/sdk';
import { Provider } from './provider.config';

const rpc: Record<string, string> = {
	[Network.Ethereum]: process.env.REACT_APP_ETH_RPC || Provider.Cloudflare,
	[Network.Local]: process.env.REACT_APP_ETH_RPC || Provider.Local,
	[Network.BinanceSmartChain]: process.env.REACT_APP_BSC_RPC || Provider.Binance,
	[Network.Polygon]: process.env.REACT_APP_MATIC_RPC || Provider.Quicknode,
	[Network.xDai]: process.env.REACT_APP_XDAI_RPC || Provider.xDai,
	[Network.Arbitrum]: process.env.REACT_APP_ARBITRUM_RPC || Provider.Arbitrum,
	[Network.Fantom]: process.env.REACT_APP_FANTOM_RPC || Provider.Fantom,
};

export const DEFAULT_RPC: Record<string, string> = {
	[Network.Ethereum]: Provider.Cloudflare,
	[Network.Local]: Provider.Local,
	[Network.BinanceSmartChain]: Provider.Binance,
	[Network.Polygon]: Provider.Quicknode,
	[Network.xDai]: Provider.xDai,
	[Network.Arbitrum]: Provider.Arbitrum,
	[Network.Fantom]: Provider.Fantom,
};

export default rpc;
