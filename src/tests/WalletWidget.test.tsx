import React from 'react';
import { customRender, act, cleanup, fireEvent, screen } from './Utils';
import WalletWidget from '../components-v2/common/WalletWidget';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';

describe('WalletWidget', () => {
	afterEach(cleanup);

	const testStore = store;

	test('Renders correctly', () => {
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Displays walletSelect menu upon click', async () => {
		customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		act(() => {
			fireEvent.click(screen.getByText('Connect'));
		});
		// Checks that menu openned by finding the MetaMask option
		expect(await screen.findByText('MetaMask')).toMatchSnapshot();
	});

	test('Connected address is properly displayed', async () => {
		testStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
