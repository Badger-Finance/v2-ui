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
		expect(await screen.findByText('MetaMask')).toMatchSnapshot();
		expect(await screen.findByText('Ledger')).toMatchSnapshot();
		expect(await screen.findByText('WalletConnect')).toMatchSnapshot();
		expect(await screen.findByText('WalletLink')).toMatchSnapshot();
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
