import { ChainNetwork } from './enums/chain-network.enum';
import { Provider } from './provider.config';

const rpc: Record<string, string> = {
	[ChainNetwork.Ethereum]: process.env.ETH_RPC || Provider.Cloudflare,
	[ChainNetwork.BinanceSmartChain]: process.env.BSC_RPC || Provider.Binance,
	[ChainNetwork.Matic]: process.env.MATIC_RPC || Provider.Quicknode,
	[ChainNetwork.xDai]: process.env.XDAI_RPC || Provider.xDai,
	[ChainNetwork.xDai]: process.env.ARBITRUM_RPC || Provider.Arbitrum,
};

export default rpc;
