import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';
import { Polygon } from 'mobx/model/network/matic.network';
import { Network } from 'mobx/model/network/network';
import { xDai } from 'mobx/model/network/xdai.network';

export const supportedNetworks: Network[] = [new Ethereum(), new Polygon(), new BinanceSmartChain(), new xDai()];
export const defaultNetwork = supportedNetworks[0];
