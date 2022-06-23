import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/local.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Network as NetworkModel } from './network';

export class Local extends NetworkModel {
  constructor() {
    super(
      'https://etherscan.io',
      'https://www.gasnow.org/',
      'Local',
      Network.Local,
      NETWORK_IDS.LOCAL,
      Currency.ETH,
      LOCAL_DEPLOY,
      localVaultDefinitions,
    );
  }

  get settOrder(): string[] {
    return [];
  }
}

export const LOCAL_DEPLOY = deploy as Deploy;

const localVaultDefinitions: BadgerVault[] = [];

export const localVaults = localVaultDefinitions;
