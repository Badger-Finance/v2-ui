import React from 'react';
import '@testing-library/jest-dom';
import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/store';
import { StoreProvider } from '../../mobx/store-context';
import { customRender, screen, fireEvent, cleanup, act } from '../Utils';
import { Mint } from '../../components/IbBTC/Mint';
import { IbbtcOptionToken } from '../../mobx/model/tokens/ibbtc-option-token';

const tokensConfig = addresses.mainnet.contracts.tokens;
const mockIbBTC = new IbbtcOptionToken(store, tokensConfig['ibBTC']);
const mockTokens = [
	new IbbtcOptionToken(store, tokensConfig['bcrvRenWSBTC']), // default option on the list
	new IbbtcOptionToken(store, tokensConfig['bcrvRenWBTC']),
	new IbbtcOptionToken(store, tokensConfig['btbtc/sbtcCrv']),
];

describe('ibBTC Mint', () => {
	beforeEach(() => {
		store.ibBTCStore.ibBTC = mockIbBTC;
		store.ibBTCStore.tokens = mockTokens;
		store.ibBTCStore.tokens[0].balance = store.ibBTCStore.tokens[0].scale('5');
		store.ibBTCStore.ibBTC.balance = mockIbBTC.scale('10');
	});

	afterEach(cleanup);

	it('displays token input balance and ibBTC balance', () => {
		customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);

		expect(screen.getByText('Balance: 5.000')).toBeInTheDocument();
		expect(screen.getByText('Balance: 10.000')).toBeInTheDocument();
	});

	it('can apply max balance', async () => {
		store.ibBTCStore.calcMintAmount = jest.fn().mockReturnValue({
			bBTC: mockIbBTC.scale('11.988'),
			fee: mockIbBTC.scale('0.0120'),
		});
		const { container } = customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);
		await act(async () => {
			fireEvent.click(await screen.findByRole('button', { name: /max/i }));
		});
		expect(container).toMatchSnapshot();
	});

	// it('displays output ibBTC when mint amount is inputted', async () => {
	// 	jest.setTimeout(12000); // in milliseconds
	// 	store.ibBTCStore.calcMintAmount = jest.fn().mockReturnValue({
	// 		bBTC: mockIbBTC.scale('11.988'),
	// 		fee: mockIbBTC.scale('0.0120'),
	// 	});

	// 	const { container } = customRender(
	// 		<StoreProvider value={store}>
	// 			<Mint />
	// 		</StoreProvider>,
	// 	);
	// 	await act(async () => {
	// 		await fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });
	// 	});
	// 	await screen.findByRole('heading', { level: 1, name: '11.988000' });
	// 	expect(container).toMatchSnapshot();
	// });

	it('handles not connected wallet', () => {
		customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);

		expect(screen.getByRole('textbox')).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeEnabled();
	});

	// This test requires of a Mock Web3 Provider which is being implemented in a separate branch

	// it('handles empty balance', async () => {
	// 	store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
	// 	customRender(
	// 		<StoreProvider value={store}>
	// 			<Snackbar>
	// 				<Header />
	// 				<Mint />
	// 			</Snackbar>
	// 		</StoreProvider>,
	// 	);
	//
	// 	fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });
	// 	fireEvent.click(screen.getByRole('button', { name: /mint/i }));
	// 	expect(await screen.findByText('You have insufficient balance of bcrvRenWSBTC')).toBeInTheDocument();
	// });
});
