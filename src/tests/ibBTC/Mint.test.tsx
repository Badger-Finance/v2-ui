import '@testing-library/jest-dom';

import { ibBTCService } from '@badger-dao/sdk';
import { cleanup, fireEvent, within } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

import { Mint } from '../../components/IbBTC/Mint';
import { TokenBalances } from '../../mobx/model/account/user-balances';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import IbBTCStore from '../../mobx/stores/ibBTCStore';
import store from '../../mobx/stores/RootStore';
import { StoreProvider } from '../../mobx/stores/store-context';
import { WalletStore } from '../../mobx/stores/WalletStore';
import { customRender, screen } from '../Utils';
import { SAMPLE_IBBTC_TOKEN_BALANCE } from '../utils/samples';

const mockTokens = [
  new TokenBalance(
    {
      name: 'bCurve.fi: renCrv Token',
      symbol: 'bcrvRenBTC',
      decimals: 18,
      address: '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
    },
    parseUnits('5', 18),
    12.47195816949324,
  ),
  new TokenBalance(
    {
      name: 'Ren Protocol BTC',
      symbol: 'renBTC',
      decimals: 8,
      address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    },
    parseUnits('10', 8),
    12.070858,
  ),
];

const tokenBalances: TokenBalances = {
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
};

jest.useFakeTimers();

describe('ibBTC Mint', () => {
  beforeEach(() => {
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';

    jest.spyOn(IbBTCStore.prototype, 'ibBTC', 'get').mockReturnValue(SAMPLE_IBBTC_TOKEN_BALANCE);
    store.user.balances = tokenBalances;
    jest.spyOn(IbBTCStore.prototype, 'initialized', 'get').mockReturnValue(true);

    store.ibBTCStore.mintFeePercent = 0;

    store.ibBTCStore.mintRates = {
      '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': '1.024385',
      '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D': '0.992518',
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': '0.992540',
      '0xd04c48A53c111300aD41190D63681ed3dAd998eC': '1.016724',
      '0xb9D076fDe463dbc9f915E5392F807315Bf940334': '1.030187',
      '0x4b92d19c11435614CD49Af1b589001b7c08cD4D5': '1.008024',
      '0x8c76970747afd5398e958bDfadA4cf0B9FcA16c4': '1.001849',
      '0x5Dce29e92b1b939F8E8C60DcF15BDE82A85be4a9': '1.003153',
      '0xf349c0faA80fC1870306Ac093f75934078e28991': '0.999124',
      '0x55912D0Cf83B75c492E761932ABc4DB4a5CB1b17': '0.999502',
    };

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    jest.spyOn(ibBTCService.prototype, 'estimateMint').mockImplementation(async (_balance) => ({
      bbtc: TokenBalance.fromBalance(SAMPLE_IBBTC_TOKEN_BALANCE, 11.988).tokenBalance,
      fee: TokenBalance.fromBalance(SAMPLE_IBBTC_TOKEN_BALANCE, 0.012).tokenBalance,
    }));
  });

  afterEach(cleanup);

  it('displays token input balance and ibBTC balance', () => {
    customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );
    // expect(screen.getByText('Balance: 5')).toBeInTheDocument();
    // expect(screen.getByText('Balance: 10')).toBeInTheDocument();
  });

  it('can apply max balance', async () => {
    const { container } = customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /max/i }));
    await screen.findByText('11.988000');
    expect(container).toMatchSnapshot();
  });

  it('displays output ibBTC when mint amount is inputted', async () => {
    const { container } = customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });
    await screen.findByRole('heading', { level: 3, name: '11.988000' });

    expect(container).toMatchSnapshot();
  });

  it('can change token', async () => {
    const { container } = customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: store.ibBTCStore.mintOptions[0].token.symbol }));

    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: store.ibBTCStore.mintOptions[1].token.symbol,
      }),
    );

    jest.runAllTimers();

    await screen.findByText(store.ibBTCStore.mintOptions[1].token.symbol);

    expect(container).toMatchSnapshot();
  });

  it('handles not connected wallet', () => {
    jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(false);
    jest.spyOn(WalletStore.prototype, 'address', 'get').mockReturnValue(undefined);

    customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeEnabled();
  });

  it('handles empty balance', async () => {
    jest.useRealTimers();

    customRender(
      <StoreProvider value={store}>
        <SnackbarProvider>
          <SnackbarManager>
            <Mint />
          </SnackbarManager>
        </SnackbarProvider>
      </StoreProvider>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });

    await screen.findByText('11.988000 ibBTC');

    fireEvent.click(screen.getByRole('button', { name: /mint/i }));

    expect(screen.getByText('You have insufficient balance of bcrvRenBTC')).toBeInTheDocument();
  });

  it('executes calcMint with correct params', async () => {
    const calcMintSpy = jest.spyOn(IbBTCStore.prototype, 'calcMintAmount');

    customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

    jest.runAllTimers();

    await screen.findByText('11.988000 ibBTC');

    expect(calcMintSpy).toHaveBeenNthCalledWith(1, TokenBalance.fromBalance(store.ibBTCStore.mintOptions[0], '0.1'));
  });

  it('executes mint with correct params', async () => {
    const mintSpy = jest
      .spyOn(IbBTCStore.prototype, 'mint')
      .mockReturnValue(Promise.resolve(TransactionRequestResult.Success));

    customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

    jest.runAllTimers();

    await screen.findByText('11.988000 ibBTC');

    fireEvent.click(screen.getByRole('button', { name: /mint/i }));

    await screen.findByDisplayValue('');

    expect(mintSpy).toHaveBeenNthCalledWith(
      1,
      TokenBalance.fromBalance(store.ibBTCStore.mintOptions[0], '0.1'),
      BigNumber.from('1'),
    );
  });
});
