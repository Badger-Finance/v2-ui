import React from 'react';
import '@testing-library/jest-dom';

import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/store';
import { StoreProvider } from '../../mobx/store-context';
import { TokenModel } from '../../mobx/model';
import { customRender, screen, fireEvent, cleanup, act } from '../Utils';
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

	afterEach(cleanup);

	it('displays ibBTC balance and output token balance', () => {
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('10');
		store.ibBTCStore.tokens[0].balance = store.ibBTCStore.tokens[0].scale('5');
		customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		expect(screen.getByText('Balance: 10.000')).toBeInTheDocument();
		expect(screen.getByText('Balance: 5.000')).toBeInTheDocument();
	});

	it('can apply max balance', async () => {
		store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('5');
		customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.click(screen.getByRole('button', { name: /max/i }));
		});
		expect(screen.getByRole('textbox')).toHaveValue('5');
	});

	// This test requires of a Mock Web3 Provider which is being implemented in a separate branch

	/* it('displays output balance when redeem amount is inputted', async () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Redeem />
			</StoreProvider>,
		);

		fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
		//jest.runAllTimers();
		await screen.findByRole('heading', { level: 1, name: '11.988' });
		expect(await screen.findByText('1 ibBTC : 1 bcrvRenWSBTC')).toBeInTheDocument(); // conversion rate
		expect(await screen.findByText('0.0120 ibBTC')).toBeInTheDocument(); // fees
		expect(await screen.findByText('11.976 bcrvRenWSBTC')).toBeInTheDocument(); // total amount
	}); */

	it('handles exceeding ibBTC redeem input amount', async () => {
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
		//jest.runAllTimers();
		await screen.findByRole('heading', { level: 1, name: '20' });
		expect(container).toMatchSnapshot();
	});

	// This test requires of a Mock Web3 Provider which is being implemented in a separate branch

	/* it('handles correct input values for redemption', async () => {
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
