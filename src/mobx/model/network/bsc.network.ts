import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/bsc.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Chain } from './chain';

export class BinanceSmartChain extends Chain {
  constructor() {
    super(
      'https://bscscan.com',
      'Binance Smart Chain',
      Network.BinanceSmartChain,
      NETWORK_IDS.BSC,
      // there are no vaults, fuck it
      Currency.ETH,
      BSC_DEPLOY,
      bscVaults,
    );
  }
}

export const BSC_DEPLOY: Deploy = deploy;

export const bscVaults: BadgerVault[] = [
  {
    depositToken: {
      address: BSC_DEPLOY.tokens['pancake.BTCB-BNB'],
      decimals: 18,
    },
    vaultToken: {
      address: BSC_DEPLOY.sett_system.vaults['native.pancakeBnbBtcb'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: BSC_DEPLOY.tokens['pancake.bBADGER-BTCB'],
      decimals: 18,
    },
    vaultToken: {
      address: BSC_DEPLOY.sett_system.vaults['native.bBadgerBtcb'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: BSC_DEPLOY.tokens['pancake.bDIGG-BTCB'],
      decimals: 18,
    },
    vaultToken: {
      address: BSC_DEPLOY.sett_system.vaults['native.bDiggBtcb'],
      decimals: 18,
    },
  },
];
