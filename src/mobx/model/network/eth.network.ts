import { Currency, Network } from '@badger-dao/sdk';
import { NETWORK_IDS } from 'config/constants';
import { Deploy } from 'web3/deploy';

import deploy from '../../../config/deployments/mainnet.json';
import { AdvisoryType } from '../vaults/advisory-type';
import { BadgerVault } from '../vaults/badger-vault';
import { Chain } from './chain';

export class Ethereum extends Chain {
  constructor() {
    super(
      'https://etherscan.io',
      'Ethereum',
      Network.Ethereum,
      NETWORK_IDS.ETH,
      Currency.ETH,
      ETH_DEPLOY,
      ethVaultDefinitions,
    );
  }

  get settOrder(): string[] {
    return [
      this.deploy.sett_system.vaults['native.graviaura'],
      this.deploy.sett_system.vaults['native.icvx'],
      this.deploy.sett_system.vaults['native.bveCVXCVX'],
      this.deploy.sett_system.vaults['native.cvxCrv'],
      this.deploy.sett_system.vaults['native.ibbtcCrv'],
      this.deploy.sett_system.vaults['native.badgerCrv'],
    ];
  }
}

export const ETH_DEPLOY = deploy as Deploy;

const ethVaultDefinitions: BadgerVault[] = [
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.mim-3crv'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.mim-3crv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.frax-3crv'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.frax-3crv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['sushi.wBTC-DIGG'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.sushiDiggWbtc'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.sushiDiggWbtc'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['sushi.wBTC-BADGER'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.sushiBadgerWbtc'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.sushiBadgerWbtc'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['sushi.wBTC-WETH'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.sushiWbtcEth'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.sushiWbtcEth'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['sushi.ibBTC-wBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.sushiibBTCwBTC'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['uni.wBTC-BADGER'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.uniBadgerWbtc'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.uniBadgerWbtc'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['uni.wBTC-DIGG'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.uniDiggWbtc'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.uniDiggWbtc'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens.badger,
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.badger'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.badger'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens.badger,
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.rembadger'],
      decimals: 18,
    },
    withdrawAdvisory: AdvisoryType.Remuneration,
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens.digg,
      decimals: 9,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.digg'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens.wBTC,
      decimals: 8,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['yearn.wBtc'],
      decimals: 8,
    },
    geyser: ETH_DEPLOY.geysers['yearn.wBtc'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.renWBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.renCrv'],
      decimals: 18,
      name: 'bcrvrenBTC',
    },
    geyser: ETH_DEPLOY.geysers['native.renCrv'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.renWBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['harvest.renCrv'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['harvest.renCrv'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.tBTC-sBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.tbtcCrv'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.tbtcCrv'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.renWSBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.sbtcCrv'],
      decimals: 18,
    },
    geyser: ETH_DEPLOY.geysers['native.sbtcCrv'],
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens.digg,
      decimals: 9,
      symbol: 'DIGG',
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['experimental.digg'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.hBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.hbtcCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.pBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.pbtcCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.oBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.obtcCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.bBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.bbtcCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.tricrypto'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.tricryptoCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.tricrypto2'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.tricryptoCrv2'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['cvx'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.cvx'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['cvx'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.icvx'],
      decimals: 18,
    },
    depositAdvisory: AdvisoryType.ConvexLock,
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['cvxCRV'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.cvxCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['renBTC'],
      decimals: 8,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.renBtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['imBtc'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.imBtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['fPmBtcHBtc'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.fPmBtcHBtc'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['bveCVXCVX'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.bveCVXCVX'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.ibBTC'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.ibbtcCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['curve.badger'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.badgerCrv'],
      decimals: 18,
    },
  },
  {
    depositToken: {
      address: ETH_DEPLOY.tokens['aura'],
      decimals: 18,
    },
    vaultToken: {
      address: ETH_DEPLOY.sett_system.vaults['native.graviaura'],
      decimals: 18,
    },
    depositAdvisory: AdvisoryType.VaultLock,
  },
];

export const ethVaults = ethVaultDefinitions;
