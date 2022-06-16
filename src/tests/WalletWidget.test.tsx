import '@testing-library/jest-dom';

import React from 'react';

import WalletWidget from '../components-v2/common/WalletWidget';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import { WalletStore } from '../mobx/stores/WalletStore';
import { cleanup, customRender, fireEvent, screen } from './Utils';

/* eslint-disable */

jest.unmock('web3modal');

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

	test('Renders mobile version correctly', () => {
		function createMatchMedia() {
			return (): MediaQueryList => ({
				media: '480px',
				matches: true,
				addEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				removeEventListener: () => {},
				onchange: () => {},
				dispatchEvent: () => true,
			});
		}

		window.matchMedia = createMatchMedia();

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
		fireEvent.click(screen.getByRole('button', { name: /connect/i }));
		expect(screen.getByText('WalletConnect')).toBeInTheDocument();
		expect(screen.getByText('Portis')).toBeInTheDocument();
		expect(screen.getByText('Coinbase')).toBeInTheDocument();
	});

	test('Connected address is properly displayed', async () => {
		jest.spyOn(WalletStore.prototype, 'isConnected', 'get').mockReturnValue(true);
		jest.spyOn(WalletStore.prototype, 'address', 'get').mockReturnValue(
			'0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
		);
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<WalletWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
});
