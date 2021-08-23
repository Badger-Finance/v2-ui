import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';
import { Polygon } from 'mobx/model/network/matic.network';
import { Network } from 'mobx/model/network/network';
import { xDai } from 'mobx/model/network/xdai.network';
import { FLAGS } from './environment';

export const supportedNetworks: Network[] = [
	new Ethereum(),
	new BinanceSmartChain(),
	...(FLAGS.MATIC ? [new Polygon()] : []),
	...(FLAGS.XDAI ? [new xDai()] : []),
];
export const defaultNetwork = supportedNetworks[0];
