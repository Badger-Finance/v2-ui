import { Arbitrum } from 'mobx/model/network/arbitrum.network';
import { Avalanche } from 'mobx/model/network/avalanche.network';
import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';
import { Fantom } from 'mobx/model/network/ftm.network';
import { Local } from 'mobx/model/network/local.network';
import { Polygon } from 'mobx/model/network/matic.network';
import { Network } from 'mobx/model/network/network';
import { xDai } from 'mobx/model/network/xdai.network';
import { DEBUG, FLAGS } from './environment';

export const supportedNetworks: Network[] = [
	new Ethereum(),
	...(DEBUG ? [new Local()] : []),
	new Polygon(),
	new BinanceSmartChain(),
	new Arbitrum(),
	...(FLAGS.AVAX ? [new Avalanche()] : []),
	...(FLAGS.XDAI ? [new xDai()] : []),
	...(FLAGS.FTM ? [new Fantom()] : []),
];
export const defaultNetwork = supportedNetworks[0];
