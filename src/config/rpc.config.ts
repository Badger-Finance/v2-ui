import { Network } from '@badger-dao/sdk';
import { Provider } from './provider.config';

const rpc: Record<string, string> = {
  [Network.Ethereum]: process.env.REACT_APP_ETH_RPC || Provider.Cloudflare,
  [Network.BinanceSmartChain]: process.env.REACT_APP_BSC_RPC || Provider.Binance,
  [Network.Polygon]: process.env.REACT_APP_MATIC_RPC || Provider.Quicknode,
  [Network.xDai]: process.env.REACT_APP_XDAI_RPC || Provider.xDai,
  [Network.Arbitrum]: process.env.REACT_APP_ARBITRUM_RPC || Provider.Arbitrum,
};

export const DEFAULT_RPC: Record<string, string> = {
  [Network.Ethereum]: Provider.Cloudflare,
  [Network.BinanceSmartChain]: Provider.Binance,
  [Network.Polygon]: Provider.Quicknode,
  [Network.xDai]: Provider.xDai,
  [Network.Arbitrum]: Provider.Arbitrum,
};

export default rpc;
