import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/avalanche.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';

export class Avalanche extends NetworkModel {
  constructor() {
    super(
      'https://snowtrace.io/',
      'https://snowtrace.io/gastracker',
      'Avalanche',
      Network.Avalanche,
      NETWORK_IDS.AVAX,
      Currency.AVAX,
      AVAX_DEPLOY,
      avaxVaults,
    );
  }
}

export const AVAX_DEPLOY: Deploy = deploy;

export const avaxVaults: BadgerVault[] = [
  {
    depositToken: {
      address: AVAX_DEPLOY.tokens['WBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: AVAX_DEPLOY.sett_system.vaults['BWBTC'],
      decimals: 18,
    },
  },
];
