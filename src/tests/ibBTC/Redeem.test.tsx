import React from 'react';
import '@testing-library/jest-dom';

import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/store';
import { StoreProvider } from '../../mobx/store-context';
import { TokenModel } from '../../mobx/model';
import { customRender, screen, fireEvent, act } from '../Utils';
import { Redeem } from '../../components/IbBTC/Redeem';

const tokensConfig = addresses.mainnet.contracts.tokens;

describe('ibBTC Redeem', () => {
	beforeEach(() => {
		store.ibBTCStore.ibBTC = new TokenModel(store, tokensConfig['ibBTC']);
		store.ibBTCStore.tokens = [
			new TokenModel(store, tokensConfig['bcrvRenWSBTC']), // default option on the list
			new TokenModel(store, tokensConfig['bcrvRenWBTC']),
			new TokenModel(store, tokensConfig['btbtc/sbtcCrv']),
		];
		store.ibBTCStore.calcRedeemAmount = jest.fn().mockReturnValue({
			fee: store.ibBTCStore.ibBTC.scale('0.0120'),
			max: store.ibBTCStore.ibBTC.scale('15'),
			sett: store.ibBTCStore.tokens[0].scale('11.988'),
		});
	});

	it('displays ibBTC balance and output token balance', () => {
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('10');
		customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		expect(screen.getByText('Balance: 10.000')).toBeInTheDocument();
	});

	it('can apply max balance', async () => {
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('5');
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.click(screen.getByRole('button', { name: /max/i }));
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

	it('displays output balance when redeem amount is inputted', async () => {
		jest.useFakeTimers();
		store.ibBTCStore.getRedeemConversionRate = jest.fn().mockReturnValue(store.ibBTCStore.tokens[0].scale('1'));
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
		await screen.findByRole('heading', { level: 1, name: '11.988000' });
		expect(container).toMatchSnapshot();
	});

	// These tests require of a Mock Web3 Provider which is being implemented in a separate branch

	/* 	it('handles exceeding ibBTC redeem input amount', async () => {
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.ibBTCStore.calcRedeemAmount = jest.fn().mockReturnValue({
			fee: store.ibBTCStore.ibBTC.scale('0.0120'),
			max: store.ibBTCStore.ibBTC.scale('10'),
			sett: store.ibBTCStore.tokens[0].scale('20'),
		});
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		fireEvent.change(screen.getByRole('textbox'), { target: { value: '20' } });
		await screen.findByRole('heading', { level: 1, name: '20' });
	});*/

	/* it('handles correct input values for redemption', async () => {
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
		});
		screen.getByRole('button', { name: /redeem/i });
		expect(container).toMatchSnapshot();
	}); */
});
