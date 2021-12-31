import { TokenZap } from '../../mobx/model/vaults/token-zap';
import { RenVaultZap } from '../../mobx/model/vaults/ren-vault-zap';
import { GeneralVaultZap } from 'mobx/model/vaults/general-vault-zap';
import { IbBTCMintZapFactory } from '../../mobx/ibbtc-mint-zap-factory';
import store from '../../mobx/RootStore';

describe('IbBTCMintZapFactory', () => {
  describe('creates the correct zap class instance', () => {
    test.each([
      [
        'bcrvrenBTC',
        RenVaultZap,
        {
          name: 'bCurve.fi: renCrv Token',
          symbol: 'bcrvrenBTC',
          decimals: 18,
          address: '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
        },
      ],
      [
        'renBTC',
        TokenZap,
        {
          name: 'Ren Protocol BTC',
          symbol: 'renBTC',
          decimals: 8,
          address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
        },
      ],
      [
        'WBTC',
        TokenZap,
        {
          name: 'Wrapped Bitcoin',
          symbol: 'WBTC',
          decimals: 8,
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
      ],
      [
        'bcrvsBTC',
        GeneralVaultZap,
        {
          name: 'bCurve.fi renBTC/wBTC/sBTC',
          symbol: 'bcrvsBTC',
          decimals: 18,
          address: '0xd04c48A53c111300aD41190D63681ed3dAd998eC',
        },
      ],
      [
        'bcrvtBTC',
        GeneralVaultZap,
        {
          name: 'bCurve.fi tBTC',
          symbol: 'bcrvtBTC',
          decimals: 18,
          address: '0xb9D076fDe463dbc9f915E5392F807315Bf940334',
        },
      ],
      [
        'byvWBTC',
        GeneralVaultZap,
        {
          name: 'Yearn WBTC',
          symbol: 'byvWBTC',
          decimals: 8,
          address: '0x4b92d19c11435614CD49Af1b589001b7c08cD4D5',
        },
      ],
      [
        'bcrvhBTC',
        GeneralVaultZap,
        {
          name: 'bCurve.fi hBTC/wBTC',
          symbol: 'bcrvhBTC',
          decimals: 18,
          address: '0x8c76970747afd5398e958bDfadA4cf0B9FcA16c4',
        },
      ],
      [
        'bcrvbBTC',
        GeneralVaultZap,
        {
          name: 'bCurve.fi bBTC/wBTC',
          symbol: 'bcrvbBTC',
          decimals: 18,
          address: '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9',
        },
      ],
      [
        'bcrvoBTC',
        GeneralVaultZap,
        {
          name: 'bCurve.fi oBTC/wBTC',
          symbol: 'bcrvoBTC',
          decimals: 18,
          address: '0xf349c0faA80fC1870306Ac093f75934078e28991',
        },
      ],
      [
        'bcrvpBTC',
        GeneralVaultZap,
        {
          name: 'bCurve.fi pBTC/wBTC',
          symbol: 'bcrvpBTC',
          decimals: 18,
          address: '0x55912D0Cf83B75c492E761932ABc4DB4a5CB1b17',
        },
      ],
    ])(`zap contract for token %s is %p`, (_symbol, zapClass, token) => {
      expect(IbBTCMintZapFactory.getIbBTCZap(store, token)).toBeInstanceOf(zapClass);
    });
  });
});
