import React from 'react';
import '@testing-library/jest-dom';
import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { customRender, screen, fireEvent, act } from '../Utils';
import { Redeem } from '../../components/IbBTC/Redeem';
import { IbbtcOptionToken } from '../../mobx/model/tokens/ibbtc-option-token';
import Header from '../../components/Header';
import { Snackbar } from '../../components/Snackbar';

const tokensConfig = addresses.mainnet.tokens;

describe('ibBTC Redeem', () => {
	beforeEach(() => {
		store.ibBTCStore.ibBTC = new IbbtcOptionToken(store, tokensConfig['ibBTC']);
		store.ibBTCStore.tokens = [new IbbtcOptionToken(store, addresses.mainnet.tokens['bcrvRenBTC'])];
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('5');
		store.ibBTCStore.calcRedeemAmount = jest.fn().mockReturnValue({
			fee: store.ibBTCStore.ibBTC.scale('0.0120'),
			max: store.ibBTCStore.ibBTC.scale('15'),
			sett: store.ibBTCStore.tokens[0].scale('11.988'),
		});
		store.ibBTCStore.getRedeemConversionRate = jest.fn().mockReturnValue(store.ibBTCStore.tokens[0].scale('1'));
		store.ibBTCStore.redeem = jest.fn();
	});

	it('displays ibBTC balance and output token balance', () => {
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('10');
		customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		expect(screen.getByText('Balance: 10.000000')).toBeInTheDocument();
	});

	it('can apply max balance', async () => {
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('5');
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.click(await screen.findByRole('button', { name: /max/i }));
		});
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
				fee: store.ibBTCStore.ibBTC.scale('0.0120'),
				max: store.ibBTCStore.ibBTC.scale('100'),
				sett: store.ibBTCStore.tokens[0].scale('20'),
			});
		});

		it('displays output balance when redeem amount is inputted', async () => {
			const { container } = customRender(
				<StoreProvider value={store}>
					<Redeem />
				</StoreProvider>,
			);

			fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });

			await screen.findByText('20.000000 bcrvRenBTC');

			expect(container).toMatchSnapshot();
		});

		it('handles exceeding ibBTC redeem input amount', async () => {
			customRender(
				<StoreProvider value={store}>
					<Snackbar>
						<Header />
						<Redeem />
					</Snackbar>
				</StoreProvider>,
			);

			fireEvent.change(screen.getByRole('textbox'), { target: { value: '20' } });

			await screen.findByText('20.000000 bcrvRenBTC');

			fireEvent.click(screen.getByRole('button', { name: /redeem/i }));

			expect(screen.getByText('You have insufficient balance of ibBTC')).toBeInTheDocument();
		});

		it('executes redeem with correct params', async () => {
			const redeemSpy = jest.fn();
			store.ibBTCStore.redeem = redeemSpy;

			customRender(
				<StoreProvider value={store}>
					<Snackbar>
						<Header />
						<Redeem />
					</Snackbar>
				</StoreProvider>,
			);

			fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

			await screen.findByText('20.000000 bcrvRenBTC');

			fireEvent.click(screen.getByRole('button', { name: /redeem/i }));

			await screen.findByDisplayValue('');

			expect(redeemSpy).toHaveBeenNthCalledWith(
				1,
				store.ibBTCStore.tokens[0],
				store.ibBTCStore.tokens[0].scale('0.1'),
			);
		});

		it('executes calcRedeem and getRedeemConversionRate with correct params', async () => {
			const calcRedeemSpy = jest.fn().mockReturnValue({
				fee: store.ibBTCStore.ibBTC.scale('0.0120'),
				max: store.ibBTCStore.ibBTC.scale('100'),
				sett: store.ibBTCStore.tokens[0].scale('20'),
			});

			const getConversionSpy = jest.fn().mockReturnValue(Promise.resolve(store.ibBTCStore.tokens[0].scale('20')));

			store.ibBTCStore.calcRedeemAmount = calcRedeemSpy;
			store.ibBTCStore.getRedeemConversionRate = getConversionSpy;

			customRender(
				<StoreProvider value={store}>
					<Snackbar>
						<Header />
						<Redeem />
					</Snackbar>
				</StoreProvider>,
			);

			fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });

			await screen.findByText('20.000000 bcrvRenBTC');

			expect(calcRedeemSpy).toHaveBeenNthCalledWith(
				1,
				store.ibBTCStore.tokens[0],
				store.ibBTCStore.ibBTC.scale('12'),
			);

			expect(getConversionSpy).toHaveBeenNthCalledWith(1, store.ibBTCStore.tokens[0]);
		});
	});
});
