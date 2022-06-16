import { Arbitrum } from 'mobx/model/network/arbitrum.network';
import { BinanceSmartChain } from 'mobx/model/network/bsc.network';
import { Ethereum } from 'mobx/model/network/eth.network';
import { Fantom } from 'mobx/model/network/ftm.network';
import { Local } from 'mobx/model/network/local.network';
import { Polygon } from 'mobx/model/network/matic.network';
import { Network } from 'mobx/model/network/network';

import { DEBUG } from './environment';

export const supportedNetworks: Network[] = [
	new Ethereum(),
	...(DEBUG ? [new Local()] : []),
	new Polygon(),
	new BinanceSmartChain(),
	new Arbitrum(),
	new Fantom(),
];
export const defaultNetwork = supportedNetworks[0];
