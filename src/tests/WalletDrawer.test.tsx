import React from 'react';
import '@testing-library/jest-dom';
import { OnboardStore } from '../mobx/stores/OnboardStore';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import WalletDrawer from '../components-v2/common/WalletDrawer';
import { customRender, screen, fireEvent } from './Utils';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import * as copy from 'copy-to-clipboard';
import UserStore from '../mobx/stores/UserStore';
import deploy from '../config/deployments/mainnet.json';
import BigNumber from 'bignumber.js';

jest.mock('copy-to-clipboard', () => {
	return jest.fn().mockReturnValue(true);
});

describe('Wallet Drawer', () => {
	beforeEach(() => {
		store.uiState.showWalletDrawer = true;
		store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		jest.spyOn(OnboardStore.prototype, 'isActive').mockReturnValue(true);
		jest.spyOn(UserStore.prototype, 'getTokenBalance').mockImplementation((token) => {
			if (token === deploy.tokens.badger) {
				return new TokenBalance(
					{
						address: '0x1',
						name: 'Badger',
						symbol: 'Badger',
						decimals: 18,
					},
					new BigNumber(1000 * 1e18),
					new BigNumber(80),
				);
			} else {
				return new TokenBalance(
					{
						address: '0x2',
						name: 'Digg',
						symbol: 'DIGG',
						decimals: 8,
					},
					new BigNumber(0.1 * 1e8),
					new BigNumber(50000),
				);
			}
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('displays correctly', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<WalletDrawer />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});

	it('disconnects wallet', () => {
		jest.useFakeTimers();
		const disconnectSpy = jest.fn();
		store.onboard.disconnect = disconnectSpy;

		customRender(
			<StoreProvider value={store}>
				<WalletDrawer />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'disconnect wallet' }));
		jest.runAllTimers();
		expect(disconnectSpy).toHaveBeenCalled();
	});

	it('copies wallet address', () => {
		jest.spyOn(copy, 'default').mockReturnValue(true);

		customRender(
			<StoreProvider value={store}>
				<WalletDrawer />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'copy wallet address' }));
		expect(screen.getByText('Wallet Address Copied')).toBeInTheDocument();
	});

	it('dismisses copied wallet address message', () => {
		jest.spyOn(copy, 'default').mockReturnValue(true);

		customRender(
			<StoreProvider value={store}>
				<WalletDrawer />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'copy wallet address' }));
		fireEvent.click(screen.getByRole('button', { name: 'dismiss copied address message' }));
		expect(screen.queryByText('Wallet Address Copied')).not.toBeInTheDocument();
	});
});
