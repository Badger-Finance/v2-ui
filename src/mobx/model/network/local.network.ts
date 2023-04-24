import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/local.json';
import { BadgerVault } from '../vaults/badger-vault';
import { Chain } from './chain';

export class Local extends Chain {
  constructor() {
    super(
      'https://etherscan.io',
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
