import React from 'react';
import '@testing-library/jest-dom';
import store from 'mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { customRender, screen, fireEvent, cleanup, act } from '../Utils';
import { Mint } from '../../components/IbBTC/Mint';
import { Snackbar } from '../../components/Snackbar';
import Header from '../../components/Header';
import IbBTCStore from 'mobx/stores/ibBTCStore';
import { within } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { SAMPLE_IBBTC_TOKEN_BALANCE } from '../utils/samples';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import { TransactionRequestResult } from '../../mobx/utils/web3';

const mockTokens = [
  new TokenBalance(
    {
      name: 'bCurve.fi: renCrv Token',
      symbol: 'bcrvRenBTC',
      decimals: 18,
      address: '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545',
    },
    new BigNumber('5000000000000000000'),
    new BigNumber('12.47195816949324'),
  ),
  new TokenBalance(
    {
      name: 'Ren Protocol BTC',
      symbol: 'renBTC',
      decimals: 8,
      address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    },
    new BigNumber('1000000000'),
    new BigNumber('12.070858'),
  ),
];

describe('ibBTC Mint', () => {
  beforeEach(() => {
    jest.useFakeTimers();

    store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';

    jest.spyOn(IbBTCStore.prototype, 'ibBTC', 'get').mockReturnValue(SAMPLE_IBBTC_TOKEN_BALANCE);
    jest.spyOn(IbBTCStore.prototype, 'tokenBalances', 'get').mockReturnValue(mockTokens);
    jest.spyOn(IbBTCStore.prototype, 'initialized', 'get').mockReturnValue(true);

    store.ibBTCStore.mintFeePercent = new BigNumber(0);

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
    jest.spyOn(IbBTCStore.prototype, 'calcMintAmount').mockImplementation(async (_balance) => ({
      bBTC: TokenBalance.fromBalance(SAMPLE_IBBTC_TOKEN_BALANCE, '11.988').tokenBalance,
      fee: TokenBalance.fromBalance(SAMPLE_IBBTC_TOKEN_BALANCE, '0.0120').tokenBalance,
    }));
  });

  afterEach(cleanup);

  it('displays token input balance and ibBTC balance', () => {
    customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );
    expect(screen.getByText('Balance: 5.000000')).toBeInTheDocument();
    expect(screen.getByText('Balance: 10.000000')).toBeInTheDocument();
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
    await screen.findByRole('heading', { level: 1, name: '11.988000' });

    expect(container).toMatchSnapshot();
  });

  it('can change token', async () => {
    const { container } = customRender(
      <StoreProvider value={store}>
        <Mint />
      </StoreProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'token options' }));

    const newTokenOption = within(screen.getByRole('list', { name: 'token options list' })).getByAltText(
      `${store.ibBTCStore.mintOptions[1].token.symbol} icon`,
    );

    fireEvent.click(newTokenOption);

    jest.runAllTimers();

    await screen.findByText(store.ibBTCStore.mintOptions[1].token.symbol);

    expect(container).toMatchSnapshot();
  });

  it('handles not connected wallet', () => {
    store.onboard.address = undefined;

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
        <Snackbar>
          <Header />
          <Mint />
        </Snackbar>
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
      new BigNumber('1'),
    );
  });
});
