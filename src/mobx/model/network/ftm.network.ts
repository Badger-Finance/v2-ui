import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/ftm.json';
import { AdvisoryType } from '../vaults/advisory-type';
import { BadgerVault } from '../vaults/badger-vault';
import { Chain } from './chain';

export class Fantom extends Chain {
  constructor() {
    super('https://ftmscan.com', 'Fantom', Network.Fantom, NETWORK_IDS.FTM, Currency.FTM, FTM_DEPLOY, ftmVaults);
  }

  get settOrder(): string[] {
    return [
      this.deploy.sett_system.vaults['native.veoxd'],
      this.deploy.sett_system.vaults['native.bveoxd-oxd'],
      this.deploy.sett_system.vaults['native.oxsolid'],
      // oxd vaults need to be up top or tritium will come a' knocking
      this.deploy.sett_system.vaults['native.usdc-dei'],
    ];
  }
}

export const FTM_DEPLOY: Deploy = deploy;

export const ftmVaults: BadgerVault[] = [
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wbtc-renbtc'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wbtc-renbtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-sex'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-sex'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.solid-solidsex'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.solid-solidsex'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.weve-usdc'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.weve-usdc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.oxd-usdc'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.oxd-usdc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-crv'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-crv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.usdc-mim'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.usdc-mim'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-renbtc'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-renbtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-crv'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-crv-eco'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.boo-xboo'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.boo-xboo-eco'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.usdc-mim'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.usdc-mim-eco'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-scream'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-scream-eco'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-renbtc'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-renbtc-eco'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.wftm-tomb'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.wftm-tomb-eco'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.geist-g3crv'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.geist-g3crv'],
      decimals: 18,
    },
    depositAdvisory: AdvisoryType.VaultLock,
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['oxd'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.veoxd'],
      decimals: 18,
    },
    depositAdvisory: AdvisoryType.ConvexLock,
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.bveoxd-oxd'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.bveoxd-oxd'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['oxsolid'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.oxsolid'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: FTM_DEPLOY.tokens['solidly.usdc-dei'],
      decimals: 18,
    },
    vaultToken: {
      address: FTM_DEPLOY.sett_system.vaults['native.usdc-dei'],
      decimals: 18,
    },
  },
];
