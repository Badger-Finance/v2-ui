import React from 'react';
import { action } from 'mobx';
import BigNumber from 'bignumber.js';
import '@testing-library/jest-dom';

import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/store';
import { StoreProvider } from '../../mobx/store-context';
import { TokenModel } from '../../mobx/model';
import { customRender, screen, fireEvent } from '../Utils';
import { Redeem } from '../../components/IbBTC/Redeem';

const tokensConfig = addresses.mainnet.contracts.tokens;
const mockIbBTC = new TokenModel(store, tokensConfig['ibBTC']);
const mockTokens = [
	new TokenModel(store, tokensConfig['bcrvRenWSBTC']), // default option on the list
	new TokenModel(store, tokensConfig['bcrvRenWBTC']),
	new TokenModel(store, tokensConfig['btbtc/sbtcCrv']),
];

const mockCalcRedeemAmount = action(
	jest.fn().mockImplementation(async (t: TokenModel, bn: BigNumber, callback: (_: any, result: any) => void) => {
		callback(null, {
			0: mockTokens[0].scale('0.98'),
			1: mockIbBTC.scale('0.0010'),
			fee: mockIbBTC.scale('0.0010'),
			max: mockIbBTC.scale('10'),
			sett: mockTokens[0].scale('0.98'),
		});
	}),
);

const mockExceedingCalcRedeemAmount = action(
	jest.fn().mockImplementation(async (t: TokenModel, bn: BigNumber, callback: (_: any, result: any) => void) => {
		callback(null, {
			0: mockTokens[0].scale('100'),
			1: mockIbBTC.scale('0.100'),
			fee: mockIbBTC.scale('0.100'),
			max: mockIbBTC.scale('10'),
			sett: mockTokens[0].scale('100'),
		});
	}),
);

it('displays ibBTC balance and output token balance', () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.ibBTC.balance = mockIbBTC.scale('10');
	store.ibBTCStore.tokens[0].balance = store.ibBTCStore.tokens[0].scale('5');
	store.ibBTCStore.calcRedeemAmount = mockCalcRedeemAmount;
	customRender(
		<StoreProvider value={store}>
			<Redeem />
		</StoreProvider>,
	);

	expect(screen.getAllByText('Balance: 10.000')).toHaveLength(2);
});

it('can apply max balance', () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.calcRedeemAmount = mockCalcRedeemAmount;
	store.ibBTCStore.ibBTC.balance = store.ibBTCStore.ibBTC.scale('5');
	customRender(
		<StoreProvider value={store}>
			<Redeem />
		</StoreProvider>,
	);

	fireEvent.click(screen.getByRole('button', { name: /max/i }));
	expect(screen.getByRole('textbox')).toHaveValue('5');
});

it('displays output balance when redeem amount is inputted', async () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.calcRedeemAmount = mockCalcRedeemAmount;
	customRender(
		<StoreProvider value={store}>
			<Redeem />
		</StoreProvider>,
	);

	fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
	expect(await screen.findByText('0.98')).toBeInTheDocument(); //output amount
	expect(await screen.findByText('1 ibBTC : 0.0817 bcrvRenWSBTC')).toBeInTheDocument(); // conversion rate
	expect(await screen.findByText('0.0010 ibBTC')).toBeInTheDocument(); // fees
});

it('handles exceeding ibBTC redeem input amount', async () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.calcRedeemAmount = mockExceedingCalcRedeemAmount;
	customRender(
		<StoreProvider value={store}>
			<Redeem />
		</StoreProvider>,
	);

	fireEvent.change(screen.getByRole('textbox'), { target: { value: '100' } });
	expect(await screen.findByText('A maximum of 10.0000 ibBTC can be redeemed to bcrvRenWSBTC'));
	expect(screen.getByRole('button', { name: /redeem/i })).toBeDisabled();
});

it('handles correct input values for redemption', async () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.calcRedeemAmount = mockCalcRedeemAmount;
	customRender(
		<StoreProvider value={store}>
			<Redeem />
		</StoreProvider>,
	);

	fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
	expect(screen.getByRole('button', { name: /redeem/i })).toBeEnabled();
});
