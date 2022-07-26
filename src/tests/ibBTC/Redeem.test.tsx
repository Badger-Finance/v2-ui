import '@testing-library/jest-dom';

import { parseEther } from 'ethers/lib/utils';
import React from 'react';
import { ToastContainer } from 'react-toastify';

import { ibBTCService, TransactionStatus } from '../../../../sdk';
import { Redeem } from '../../components/IbBTC/Redeem';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import store from '../../mobx/stores/RootStore';
import { StoreProvider } from '../../mobx/stores/store-context';
import { customRender, fireEvent, screen } from '../Utils';
import { SAMPLE_IBBTC_USER_BALANCES } from '../utils/samples';
import SpyInstance = jest.SpyInstance;

describe('ibBTC Redeem', () => {
  let estimateRedeemSpy: SpyInstance;
  beforeEach(() => {
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    store.user.balances = SAMPLE_IBBTC_USER_BALANCES;
    store.ibBTCStore.mintFeePercent = 0;
    store.ibBTCStore.redeemFeePercent = 0;

    store.ibBTCStore.mintRates = {
      '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': '1.024385',
    };

    store.ibBTCStore.redeemRates = {
      '0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': '0.976196',
    };

    estimateRedeemSpy = jest.spyOn(ibBTCService.prototype, 'estimateRedeem').mockImplementation(async (_balance) => ({
      fee: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, 0.012).tokenBalance,
      max: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, 15).tokenBalance,
      sett: TokenBalance.fromBalance(store.ibBTCStore.redeemOptions[0], 11.988).tokenBalance,
    }));

    store.ibBTCStore.getRedeemConversionRate = jest.fn().mockReturnValue(0.97);
  });

  it('displays ibBTC balance', () => {
    customRender(
      <StoreProvider value={store}>
        <Redeem />
      </StoreProvider>,
    );

    expect(screen.getByText('Balance: 10.000000')).toBeInTheDocument();
  });

  it('can apply max balance', async () => {
    const { container } = customRender(
      <StoreProvider value={store}>
        <Redeem />
      </StoreProvider>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /max/i }));
    await screen.findByText('11.988000');
    expect(container).toMatchSnapshot();
  });

  describe('Input Change', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    });

    it('displays output balance when redeem amount is inputted', async () => {
      const { container } = customRender(
        <StoreProvider value={store}>
          <Redeem />
        </StoreProvider>,
      );

      fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });

      jest.runAllTimers();

      await screen.findByText('11.988000');

      expect(container).toMatchSnapshot();
    });

    it('handles exceeding ibBTC redeem input amount', async () => {
      jest.useFakeTimers();

      customRender(
        <StoreProvider value={store}>
          <ToastContainer position="bottom-right" newestOnTop={true} closeOnClick theme="dark" draggable />
          <Redeem />
        </StoreProvider>,
      );

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '20' } });

      jest.runAllTimers();

      await screen.findByText('11.988000');

      expect(screen.getByRole('button', { name: /redeem/i })).toBeDisabled();
    });

    it('executes redeem with correct params', async () => {
      const redeemSpy = jest
        .spyOn(ibBTCService.prototype, 'redeem')
        .mockReturnValue(Promise.resolve(TransactionStatus.Success));

      customRender(
        <StoreProvider value={store}>
          <Redeem />
        </StoreProvider>,
      );

      fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

      jest.runAllTimers();

      await screen.findByText('11.988000');

      fireEvent.click(screen.getByRole('button', { name: /redeem/i }));

      await screen.findByDisplayValue('');

      expect.extend({
        toHaveCorrectNonFunctionParams(received, expected) {
          const pass =
            received.token === expected.token &&
            +received.amount === +expected.amount &&
            received.slippage === expected.slippage;

          if (pass) {
            return {
              message: () => `expected ${received} to have correct non-function params`,
              pass: true,
            };
          } else {
            return {
              message: () => `expected ${received} to have correct non-function params`,
              pass: false,
            };
          }
        },
      });

      expect(redeemSpy.mock.calls[0][0]).toHaveCorrectNonFunctionParams({
        token: store.ibBTCStore.ibBTC.token.address,
        amount: parseEther('0.1'),
      });
    });

    it('executes calcRedeem and getRedeemConversionRate with correct params', async () => {
      const getConversionSpy = jest.fn().mockReturnValue(0.97);
      store.ibBTCStore.getRedeemConversionRate = getConversionSpy;

      customRender(
        <StoreProvider value={store}>
          <Redeem />
        </StoreProvider>,
      );

      fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });

      jest.runAllTimers();

      await screen.findByText('11.988000');

      expect(estimateRedeemSpy).toHaveBeenNthCalledWith(1, parseEther('12'));
      expect(getConversionSpy).toHaveBeenCalledTimes(1);
    });
  });
});
