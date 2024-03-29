import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/matic.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Chain } from './chain';

export class Polygon extends Chain {
  constructor() {
    super(
      'https://polygonscan.com/',
      'Polygon',
      Network.Polygon,
      NETWORK_IDS.MATIC,
      Currency.MATIC,
      MATIC_DEPLOY,
      maticVaults,
    );
  }
}

export const MATIC_DEPLOY: Deploy = deploy;

export const maticVaults: BadgerVault[] = [
  {
    depositToken: {
      address: MATIC_DEPLOY.tokens['SLP-IBBTC-WBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: MATIC_DEPLOY.sett_system.vaults['BSLP-IBBTC-WBTC'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: MATIC_DEPLOY.tokens['QLP-WBTC-USDC'],
      decimals: 18,
    },
    vaultToken: {
      address: MATIC_DEPLOY.sett_system.vaults['BQLP-WBTC-USDC'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: MATIC_DEPLOY.tokens['ATRICRYPTO'],
      decimals: 18,
    },
    vaultToken: {
      address: MATIC_DEPLOY.sett_system.vaults['BATRICRYPTO'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: MATIC_DEPLOY.tokens['CRV-WBTC-RENBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: MATIC_DEPLOY.sett_system.vaults['BCRV-WBTC-RENBTC'],
      decimals: 18,
    },
  },
];
