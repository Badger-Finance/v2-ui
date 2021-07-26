import { NETWORK_LIST } from './constants';
import { Provider } from './provider.config';

const rpc: Record<string, string> = {
	[NETWORK_LIST.ETH]: process.env.ETH_RPC || Provider.Cloudflare,
	[NETWORK_LIST.BSC]: process.env.BSC_RPC || Provider.Binance,
	[NETWORK_LIST.MATIC]: process.env.MATIC_RPC || Provider.Quicknode,
};

export default rpc;
