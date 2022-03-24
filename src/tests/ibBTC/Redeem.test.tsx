import React from 'react';
import '@testing-library/jest-dom';
import store from 'mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { customRender, screen, fireEvent } from '../Utils';
import { Redeem } from '../../components/IbBTC/Redeem';
import { SnackbarProvider } from '../../components/Snackbar';
import IbBTCStore from '../../mobx/stores/ibBTCStore';
import { SAMPLE_IBBTC_TOKEN_BALANCE } from '../utils/samples';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';
import { TransactionRequestResult } from '../../mobx/utils/web3';
import SnackbarManager from '../../components-v2/common/SnackbarManager';

describe('ibBTC Redeem', () => {
	beforeEach(() => {
		jest.spyOn(IbBTCStore.prototype, 'initialized', 'get').mockReturnValue(true);
		jest.spyOn(IbBTCStore.prototype, 'ibBTC', 'get').mockReturnValue(SAMPLE_IBBTC_TOKEN_BALANCE);
		jest.spyOn(IbBTCStore.prototype, 'tokenBalances', 'get').mockReturnValue([
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
		]);

		store.ibBTCStore.redeemFeePercent = new BigNumber(0);

		store.ibBTCStore.redeemRates = {
			'0x6dEf55d2e18486B9dDfaA075bc4e4EE0B28c1545': '0.976196',
		};

		store.ibBTCStore.calcRedeemAmount = jest.fn().mockReturnValue({
			fee: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '0.0120').tokenBalance,
			max: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '15').tokenBalance,
			sett: TokenBalance.fromBalance(store.ibBTCStore.redeemOptions[0], '11.988').tokenBalance,
		});

		store.ibBTCStore.getRedeemConversionRate = jest
			.fn()
			.mockReturnValue(TokenBalance.fromBalance(store.ibBTCStore.redeemOptions[0], '1').tokenBalance);
	});

	it('displays ibBTC balance and output token balance', () => {
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

	it('handles not connected wallet', () => {
		customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		expect(screen.getByRole('textbox')).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeEnabled();
	});

	describe('Input Change', () => {
		beforeEach(() => {
			jest.useFakeTimers();

			store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
			store.ibBTCStore.calcRedeemAmount = jest.fn().mockReturnValue({
				fee: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '0.0120').tokenBalance,
				max: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '100').tokenBalance,
				sett: TokenBalance.fromBalance(store.ibBTCStore.redeemOptions[0], '20').tokenBalance,
			});
		});

		it('displays output balance when redeem amount is inputted', async () => {
			const { container } = customRender(
				<StoreProvider value={store}>
					<Redeem />
				</StoreProvider>,
			);

			fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });

			jest.runAllTimers();

			await screen.findByText('20.000000');

			expect(container).toMatchSnapshot();
		});

		it('handles exceeding ibBTC redeem input amount', async () => {
			jest.useRealTimers();

			customRender(
				<StoreProvider value={store}>
					<SnackbarProvider>
						<SnackbarManager>
							<Redeem />
						</SnackbarManager>
					</SnackbarProvider>
				</StoreProvider>,
			);

			fireEvent.change(screen.getByRole('textbox'), { target: { value: '20' } });

			await screen.findByText('20.000000');

			fireEvent.click(screen.getByRole('button', { name: /redeem/i }));

			expect(screen.getByText('You have insufficient balance of ibBTC')).toBeInTheDocument();
		});

		it('executes redeem with correct params', async () => {
			const redeemMock = jest.fn().mockReturnValue(Promise.resolve(TransactionRequestResult.Success));

			store.ibBTCStore.redeem = redeemMock;

			customRender(
				<StoreProvider value={store}>
					<Redeem />
				</StoreProvider>,
			);

			fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

			jest.runAllTimers();

			await screen.findByText('20.000000');

			fireEvent.click(screen.getByRole('button', { name: /redeem/i }));

			await screen.findByDisplayValue('');

			expect(redeemMock).toHaveBeenNthCalledWith(
				1,
				TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '0.1'),
				store.ibBTCStore.redeemOptions[0].token,
			);
		});

		it('executes calcRedeem and getRedeemConversionRate with correct params', async () => {
			const calcRedeemSpy = jest.fn().mockReturnValue({
				fee: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '0.0120').tokenBalance,
				max: TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '100').tokenBalance,
				sett: TokenBalance.fromBalance(store.ibBTCStore.redeemOptions[0], '20').tokenBalance,
			});

			const getConversionSpy = jest
				.fn()
				.mockReturnValue(
					Promise.resolve(TokenBalance.fromBalance(store.ibBTCStore.redeemOptions[0], '20').tokenBalance),
				);

			store.ibBTCStore.calcRedeemAmount = calcRedeemSpy;
			store.ibBTCStore.getRedeemConversionRate = getConversionSpy;

			customRender(
				<StoreProvider value={store}>
					<Redeem />
				</StoreProvider>,
			);

			fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });

			jest.runAllTimers();

			await screen.findByText('20.000000');

			expect(calcRedeemSpy).toHaveBeenNthCalledWith(
				1,
				TokenBalance.fromBalance(store.ibBTCStore.ibBTC, '12'),
				store.ibBTCStore.redeemOptions[0].token,
			);

			expect(getConversionSpy).toHaveBeenNthCalledWith(1, store.ibBTCStore.redeemOptions[0].token);
		});
	});
});
