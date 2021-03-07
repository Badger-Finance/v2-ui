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
