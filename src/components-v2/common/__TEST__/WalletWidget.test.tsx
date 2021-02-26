import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import WalletWidget from '../WalletWidget';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

afterEach(cleanup);

describe('WalletWidget', () => {
	test('Displays disconnected wallet message', () => {
		render(
			<StoreProvider value={store}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(screen.getByText('Click to connect')).toBeInTheDocument();
	});

	test('Opens wallet menu upon click', async () => {
		render(
			<StoreProvider value={store}>
				<WalletWidget />
			</StoreProvider>,
		);
		await fireEvent.click(screen.getByText('Click to connect'));
		const Title = await screen.findByText('Connect to BadgerDAO');
		expect(Title).toBeVisible;
		const Subtitle = await screen.findByText('Deposit & Earn on your Bitcoin');
		expect(Subtitle).toBeVisible;
		const Metamask = await screen.findByText('MetaMask');
		expect(Metamask).toBeVisible;
	});

	test('Connected address is properly displayed', async () => {
		store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		render(
			<StoreProvider value={store}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(screen.getByText('0x1a1a1...a1a1a1a')).toBeInTheDocument();
	});
});
