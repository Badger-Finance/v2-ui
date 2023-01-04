import { VaultData, VaultDTOV3 } from '@badger-dao/sdk';
import mockVaults from '@badger-dao/sdk-mocks/generated/ethereum/api/loadVaultsV3.json';
import { BigNumber, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { TokenBalances } from '../../mobx/model/account/user-balances';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { BadgerVault } from '../../mobx/model/vaults/badger-vault';

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

export const SAMPLE_VAULTS: VaultDTOV3[] = mockVaults as VaultDTOV3[];
export const SAMPLE_VAULT: VaultDTOV3 = SAMPLE_VAULTS[0];

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
