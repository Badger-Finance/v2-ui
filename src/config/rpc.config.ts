import { ChainNetwork } from './enums/chain-network.enum';
import { Provider } from './provider.config';

const rpc: Record<string, string> = {
	[ChainNetwork.Ethereum]: process.env.REACT_APP_ETH_RPC || Provider.Cloudflare,
	[ChainNetwork.BinanceSmartChain]: process.env.REACT_APP_BSC_RPC || Provider.Binance,
	[ChainNetwork.Matic]: process.env.REACT_APP_MATIC_RPC || Provider.Quicknode,
	[ChainNetwork.xDai]: process.env.REACT_APP_XDAI_RPC || Provider.xDai,
	[ChainNetwork.Arbitrum]: process.env.REACT_APP_ARBITRUM_RPC || Provider.Arbitrum,
};

export const DEFAULT_RPC: Record<string, string> = {
	[ChainNetwork.Ethereum]: Provider.Cloudflare,
	[ChainNetwork.BinanceSmartChain]: Provider.Binance,
	[ChainNetwork.Matic]: Provider.Quicknode,
	[ChainNetwork.xDai]: Provider.xDai,
	[ChainNetwork.Arbitrum]: Provider.Arbitrum,
};

export default rpc;
