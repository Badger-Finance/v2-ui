import React from 'react';
import { action } from 'mobx';
import BigNumber from 'bignumber.js';
import '@testing-library/jest-dom';

import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/store';
import { StoreProvider } from '../../mobx/store-context';
import { TokenModel } from '../../mobx/model';
import { customRender, screen, fireEvent } from '../Utils';
import { Mint } from '../../components/IbBTC/Mint';
import { Snackbar } from '../../components/Snackbar';
import { Header } from '../../components/Header';

const tokensConfig = addresses.mainnet.contracts.tokens;
const mockIbBTC = new TokenModel(store, tokensConfig['ibBTC']);
const mockTokens = [
	new TokenModel(store, tokensConfig['bcrvRenWSBTC']), // default option on the list
	new TokenModel(store, tokensConfig['bcrvRenWBTC']),
	new TokenModel(store, tokensConfig['btbtc/sbtcCrv']),
];

const mockCalcMintAmount = action(
	jest.fn().mockImplementation(async (t: TokenModel, bn: BigNumber, callback: (_: any, result: any) => void) => {
		callback(null, [mockIbBTC.scale('12.18'), mockIbBTC.scale('0.088')]);
	}),
);

it('displays token input balance and ibBTC balance', () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.tokens[0].balance = store.ibBTCStore.tokens[0].scale('5');
	store.ibBTCStore.ibBTC.balance = mockIbBTC.scale('10');
	customRender(
		<StoreProvider value={store}>
			<Mint />
		</StoreProvider>,
	);

	expect(screen.getByText('Balance: 5.000')).toBeInTheDocument();
	expect(screen.getByText('Balance: 10.000')).toBeInTheDocument();
});

it('can apply max balance', () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.calcMintAmount = mockCalcMintAmount;
	store.ibBTCStore.tokens[0].balance = store.ibBTCStore.tokens[0].scale('5');
	customRender(
		<StoreProvider value={store}>
			<Mint />
		</StoreProvider>,
	);

	fireEvent.click(screen.getByRole('button', { name: /max/i }));
	expect(screen.getByRole('textbox')).toHaveValue('5');
});

it('displays output ibBTC when mint amount is inputted', async () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	store.ibBTCStore.tokens[0].mintRate = '1.015331878285475322';
	store.ibBTCStore.calcMintAmount = mockCalcMintAmount;
	customRender(
		<StoreProvider value={store}>
			<Mint />
		</StoreProvider>,
	);

	fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
	expect(await screen.findByRole('heading', { level: 1, name: '12.18' })).toBeInTheDocument(); //output amount
	expect(await screen.findByText('1 bcrvRenWSBTC : 1.0150 ibBTC')).toBeInTheDocument(); // conversion rate
	expect(await screen.findByText('0.0880 ibBTC')).toBeInTheDocument(); // fees
});

it('handles not connected balance', () => {
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	customRender(
		<StoreProvider value={store}>
			<Snackbar>
				<Header />
				<Mint />
			</Snackbar>
		</StoreProvider>,
	);

	fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
	fireEvent.click(screen.getByRole('button', { name: /mint/i }));
	expect(screen.getByText('Please connect a wallet')).toBeInTheDocument();
});

it('handles empty balance', () => {
	store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
	store.ibBTCStore.ibBTC = mockIbBTC;
	store.ibBTCStore.tokens = mockTokens;
	customRender(
		<StoreProvider value={store}>
			<Snackbar>
				<Header />
				<Mint />
			</Snackbar>
		</StoreProvider>,
	);

	fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
	fireEvent.click(screen.getByRole('button', { name: /mint/i }));
	expect(screen.getByText('You have insufficient balance of bcrvRenWSBTC')).toBeInTheDocument();
});
