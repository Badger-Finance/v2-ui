import React from 'react';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import WalletWidget from '../WalletWidget';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

afterEach(cleanup);

describe('WalletWidget', () => {
	const testStore = store;

	test('Renders correctly', () => {
		const { container } = render(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Opens wallet menu upon click', async () => {
		render(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.click(screen.getByText('Click to connect'));
		});
		const title = await screen.findByText('Connect to BadgerDAO');
		expect(title).toMatchSnapshot();
		const subtitle = await screen.findByText('Deposit & Earn on your Bitcoin');
		expect(subtitle).toMatchSnapshot();
		const metamask = await screen.findByText('MetaMask');
		expect(metamask).toMatchSnapshot();
	});

	test('Connected address is properly displayed', async () => {
		await act(async () => {
			testStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		});
		const { container } = render(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
