import '@testing-library/jest-dom';

import { act, cleanup, customRender, fireEvent, screen, waitFor } from './Utils';

import React from 'react';
import { StoreProvider } from '../mobx/store-context';
import WalletWidget from '../components-v2/common/WalletWidget';
import store from '../mobx/store';

afterEach(cleanup);

describe('WalletWidget', () => {
	const testStore = store;

	test('Renders correctly', () => {
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Runs walletSelect upon click', async () => {
		const spy = jest.spyOn(testStore.wallet.onboard, 'walletSelect');
		customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.click(screen.getByText('Click to connect'));
		});
		waitFor(() => {
			expect(spy).toHaveBeenCalled();
		});
	});

	test('Connected address is properly displayed', async () => {
		await act(async () => {
			testStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		});
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
