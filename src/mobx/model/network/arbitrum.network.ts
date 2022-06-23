import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/arbitrum.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';

export class Arbitrum extends NetworkModel {
  constructor() {
    super(
      'https://arbiscan.io/',
      'https://portal.arbitrum.one/',
      'Arbitrum',
      Network.Arbitrum,
      NETWORK_IDS.ARB,
      Currency.ETH,
      ARBITRUM_DEPLOY,
      arbitrumVaults,
    );
  }
}

export const ARBITRUM_DEPLOY: Deploy = deploy;

export const arbitrumVaults: BadgerVault[] = [
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['sushi.WETH-SUSHI'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.sushiWethSushi'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['sushi.WETH-WBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.sushiWethWbtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['crv.wbtcRen'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.crvWbtcRen'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['crv.tricrypto'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.tricrypto'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['crv.tricrypto'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.tricryptoLight'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['swapr.WETH-SWAPR'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethSwapr'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['swapr.WETH-WBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethWbtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['swapr.WETH-BADGER'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethBadger'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ARBITRUM_DEPLOY.tokens['swapr.WETH-IBBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ARBITRUM_DEPLOY.sett_system.vaults['native.swaprWethIbbtc'],
      decimals: 18,
    },
  },
];
