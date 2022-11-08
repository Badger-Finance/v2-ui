import { Network } from '@badger-dao/sdk';
import { Arbitrum } from 'mobx/model/network/arbitrum.network';
import { Chain } from 'mobx/model/network/chain';
import { Ethereum } from 'mobx/model/network/eth.network';
import { Fantom } from 'mobx/model/network/ftm.network';
import { Local } from 'mobx/model/network/local.network';

import { LOCAL } from './environment';

export const supportedNetworks: Chain[] = [
  new Ethereum(),
  ...(LOCAL ? [new Local()] : []),
  new Arbitrum(),
  new Fantom(),
];
export const defaultNetwork = Network.Ethereum;
