import {
  BouncerType,
  Protocol,
  VaultBehavior,
  VaultData,
  VaultDTO,
  VaultState,
  VaultType,
  VaultVersion,
} from '@badger-dao/sdk';
import { BigNumber, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { TokenBalances } from '../../mobx/model/account/user-balances';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';
import { TEST_ADDRESS } from './snapshots';

export const SAMPLE_IBBTC_TOKEN_BALANCE = new TokenBalance(
  {
    name: 'ibBTC',
    symbol: 'ibBTC',
    decimals: 18,
    address: '0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F',
  },
  BigNumber.from('10000000000000000000'),
  12.012381,
);

export const SAMPLE_IBBTC_USER_BALANCES: TokenBalances = {
  '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi renBTC/wBTC',
      symbol: 'bcrvRenWBTC',
      decimals: 18,
      address: '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
    },
    parseUnits('5', 18),
    23972.80210514462,
  ),
  '0x6def55d2e18486b9ddfaa075bc4e4ee0b28c1545': new TokenBalance(
    {
      name: 'bCurve.fi: renCrv Token',
      symbol: 'bcrvRenBTC',
      decimals: 18,
      address: '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
    },
    parseUnits('5', 18),
    23972.80210514462,
  ),
  '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D': new TokenBalance(
    {
      name: 'Ren Protocol BTC',
      symbol: 'renBTC',
      decimals: 8,
      address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    },
    parseUnits('10', 8),
    23972.80210514462,
  ),
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': new TokenBalance(
    {
      name: 'WBTC',
      symbol: 'wbtc',
      decimals: 8,
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
    parseUnits('0', 8),
    23972.80210514462,
  ),
  '0xd04c48A53c111300aD41190D63681ed3dAd998eC': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi renBTC/wBTC/sBTC',
      symbol: 'bcrvRenWSBTC',
      decimals: 18,
      address: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
    },
    parseUnits('0', 18),
    23972.80210514462,
  ),
  '0xb9D076fDe463dbc9f915E5392F807315Bf940334': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi tBTC/sbtcCrv',
      symbol: 'btbtc/sbtcCrv',
      decimals: 18,
      address: '0xb9D076fDe463dbc9f915E5392F807315Bf940334',
    },
    parseUnits('0', 18),
    23972.80210514462,
  ),
  '0x4b92d19c11435614CD49Af1b589001b7c08cD4D5': new TokenBalance(
    {
      name: 'Badger WBTC yVault',
      symbol: 'byvWBTC',
      decimals: 8,
      address: '0x4b92d19c11435614CD49Af1b589001b7c08cD4D5',
    },
    parseUnits('0', 8),
    23972.80210514462,
  ),
  '0x8c76970747afd5398e958bDfadA4cf0B9FcA16c4': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi hBTC/wBTC',
      symbol: 'bhCRV',
      decimals: 18,
      address: '0x8c76970747afd5398e958bDfadA4cf0B9FcA16c4',
    },
    parseUnits('0', 18),
    23972.80210514462,
  ),
  '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi bBTC/sbtcCRV',
      symbol: 'bbBTC/sbtcCRV',
      decimals: 18,
      address: '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
    },
    parseUnits('0', 18),
    23972.80210514462,
  ),
  '0xf349c0faA80fC1870306Ac093f75934078e28991': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi oBTC/sbtcCRV',
      symbol: 'boBTC/sbtcCRV',
      decimals: 18,
      address: '0xf349c0faA80fC1870306Ac093f75934078e28991',
    },
    parseUnits('0', 18),
    23972.80210514462,
  ),
  '0x55912D0Cf83B75c492E761932ABc4DB4a5CB1b17': new TokenBalance(
    {
      name: 'Badger Sett Curve.fi pBTC/sbtcCRV',
      symbol: 'bpBTC/sbtcCRV',
      decimals: 18,
      address: '0x55912D0Cf83B75c492E761932ABc4DB4a5CB1b17',
    },
    parseUnits('0', 18),
    23972.80210514462,
  ),
  '0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F': new TokenBalance(
    {
      name: 'ibBTC',
      symbol: 'ibBTC',
      decimals: 18,
      address: '0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F',
    },
    BigNumber.from('10000000000000000000'),
    12.012381,
  ),
};

export const SAMPLE_BADGER_SETT: BadgerVault = {
  depositToken: {
    address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    decimals: 18,
  },
  vaultToken: {
    address: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
    decimals: 18,
  },
};

export const SAMPLE_VAULT: VaultDTO = {
  type: VaultType.Standard,
  asset: 'sBTCCRV',
  vaultAsset: 'bsBTCCRV',
  state: VaultState.Open,
  apr: 0.123456789123454,
  apy: 0.123456789123454,
  available: 2580.4779797767615,
  balance: 2580.4779797767615,
  bouncer: BouncerType.None,
  boost: {
    enabled: false,
    weight: 0,
  },
  name: 'Curve.fi renBTC/wBTC/sBTC',
  protocol: Protocol.Convex,
  pricePerFullShare: 1.0082389531413567,
  strategy: {
    address: TEST_ADDRESS,
    withdrawFee: 50,
    performanceFee: 20,
    strategistFee: 10,
    aumFee: 0,
  },
  behavior: VaultBehavior.EcosystemHelper,
  sources: [
    {
      name: 'Vault Compounding',
      apr: 0.123456789123454,
      boostable: true,
      minApr: 0.123456789123454,
      maxApr: 1.123456789123454,
    },
    {
      name: 'Curve LP Fees',
      apr: 0.123456789123454,
      boostable: true,
      minApr: 0.123456789123454,
      maxApr: 1.123456789123454,
    },
  ],
  sourcesApy: [
    {
      name: 'Vault Compounding',
      apr: 0.123456789123454,
      boostable: true,
      minApr: 0.123456789123454,
      maxApr: 1.123456789123454,
    },
    {
      name: 'Curve LP Fees',
      apr: 0.123456789123454,
      boostable: true,
      minApr: 0.123456789123454,
      maxApr: 1.123456789123454,
    },
  ],
  tokens: [
    {
      address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
      name: 'Curve.fi renBTC/wBTC/sBTC',
      symbol: 'curve-renBTC-wBTC-sBTC',
      decimals: 18,
      balance: 2580.4779797767615,
      value: 135697015.0445408,
    },
  ],
  underlyingToken: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
  value: 135697015.0445408,
  vaultToken: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
  version: VaultVersion.v1,
  yieldProjection: {
    yieldApr: 0,
    yieldTokens: [],
    yieldValue: 0,
    harvestApr: 0,
    harvestApy: 0,
    harvestTokens: [],
    harvestValue: 0,
  },
  lastHarvest: Date.now(),
};

export const SAMPLE_VAULT_BALANCE: VaultData = {
  address: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
  name: 'Convex renBTC/wBTC/sBTC',
  symbol: 'crvsBTC',
  pricePerFullShare: 1.0131098014439799,
  balance: 400,
  value: 21219315.213123,
  tokens: [
    {
      address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
      name: 'Ren Protocol BTC',
      symbol: 'renBTC',
      decimals: 8,
      balance: 478.88017950592223,
      value: 23410536.455326512,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      balance: 472.0972849608856,
      value: 23145985.687062297,
    },
    {
      address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
      name: 'Synthetix Network BTC',
      symbol: 'sBTC',
      decimals: 18,
      balance: 337.6574109700648,
      value: 16588824.96873407,
    },
  ],
  earnedBalance: 0.0001352660720517207,
  earnedValue: 6.662841869510715,
  earnedTokens: [
    {
      address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
      name: 'Ren Protocol BTC',
      symbol: 'renBTC',
      decimals: 8,
      balance: 478.88017950592223,
      value: 23410536.455326512,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      balance: 472.0972849608856,
      value: 23145985.687062297,
    },
    {
      address: '0xfE18be6b3Bd88A2D2A7f928d00292E7a9963CfC6',
      name: 'Synthetix Network BTC',
      symbol: 'sBTC',
      decimals: 18,
      balance: 337.6574109700648,
      value: 16588824.96873407,
    },
  ],
  depositedBalance: 0.7407489634010854,
  withdrawnBalance: 0.7408842294731371,
};

export const SAMPLE_TOKEN_BALANCE = new TokenBalance(
  {
    address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
    name: 'Curve.fi renBTC/wBTC/sBTC',
    symbol: 'curve-renBTC-wBTC-sBTC',
    decimals: 18,
  },
  utils.parseEther('1.99'),
  13.16,
);

export const SAMPLE_VAULTS: VaultDTO[] = [
  SAMPLE_VAULT,
  {
    version: VaultVersion.v1,
    yieldProjection: {
      yieldApr: 0,
      yieldTokens: [],
      yieldValue: 0,
      harvestApr: 0,
      harvestApy: 0,
      harvestTokens: [],
      harvestValue: 0,
    },
    lastHarvest: Date.now(),
    name: 'Badger',
    asset: 'Badger',
    vaultAsset: 'bBadger',
    state: VaultState.Open,
    underlyingToken: '0x0000000000000000000000000000000000000001',
    vaultToken: '0x0000000000000000000000000000000000000001',
    value: 10000,
    available: 2580.4779797767615,
    balance: 100,
    protocol: Protocol.Badger,
    pricePerFullShare: 0.18907615705168573,
    tokens: [
      {
        address: '0x0000000000000000000000000000000000000001',
        name: 'Badger',
        symbol: 'BADGER',
        decimals: 10,
        balance: 100,
        value: 10000,
      },
    ],
    apr: 8.174287821972374,
    apy: 8.174287821972374,
    boost: {
      enabled: false,
      weight: 0,
    },
    behavior: VaultBehavior.DCA,
    sources: [
      {
        name: 'Vault Compounding',
        apr: 8.174287821972374,
        boostable: false,
        minApr: 8.174287821972374,
        maxApr: 8.174287821972374,
      },
    ],
    sourcesApy: [
      {
        name: 'Vault Compounding',
        apr: 8.174287821972374,
        boostable: false,
        minApr: 8.174287821972374,
        maxApr: 8.174287821972374,
      },
    ],
    bouncer: BouncerType.None,
    strategy: {
      address: '0x4a8651F2edD68850B944AD93f2c67af817F39F62',
      withdrawFee: 0,
      performanceFee: 0,
      strategistFee: 0,
      aumFee: 0,
    },
    type: VaultType.Native,
  },
  {
    version: VaultVersion.v1,
    yieldProjection: {
      yieldApr: 0,
      yieldTokens: [],
      yieldValue: 0,
      harvestApr: 0,
      harvestApy: 0,
      harvestTokens: [],
      harvestValue: 0,
    },
    lastHarvest: Date.now(),
    name: 'Digg',
    asset: 'DIGG',
    vaultAsset: 'bDIGG',
    state: VaultState.Open,
    underlyingToken: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
    vaultToken: '0x7e7E112A68d8D2E221E11047a72fFC1065c38e1a',
    value: 2873.538729634401,
    available: 2580.4779797767615,
    balance: 237.567564646,
    protocol: Protocol.Badger,
    pricePerFullShare: 0.18907615705168573,
    behavior: VaultBehavior.None,
    tokens: [
      {
        address: '0x798D1bE841a82a273720CE31c822C61a67a601C3',
        name: 'Digg',
        symbol: 'DIGG',
        decimals: 9,
        balance: 237.567564646,
        value: 2873.538729634401,
      },
    ],
    apr: 8.174287821972374,
    apy: 8.174287821972374,
    boost: {
      enabled: false,
      weight: 0,
    },
    sources: [
      {
        name: 'Vault Compounding',
        apr: 8.174287821972374,
        boostable: false,
        minApr: 8.174287821972374,
        maxApr: 8.174287821972374,
      },
    ],
    sourcesApy: [
      {
        name: 'Vault Compounding',
        apr: 8.174287821972374,
        boostable: false,
        minApr: 8.174287821972374,
        maxApr: 8.174287821972374,
      },
    ],
    bouncer: BouncerType.None,
    strategy: {
      address: '0x4a8651F2edD68850B944AD93f2c67af817F39F62',
      withdrawFee: 0,
      performanceFee: 0,
      strategistFee: 0,
      aumFee: 0,
    },
    type: VaultType.Standard,
  },
];
