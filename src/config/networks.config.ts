import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';
import { Polygon } from 'mobx/model/network/matic.network';
import { Network } from 'mobx/model/network/network';

export const supportedNetworks: Network[] = [new Ethereum(), new Polygon(), new BinanceSmartChain()];
export const defaultNetwork = supportedNetworks[0];
