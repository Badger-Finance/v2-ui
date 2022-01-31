import React from 'react';
import '@testing-library/jest-dom';
import { OnboardStore } from '../mobx/stores/OnboardStore';
import store from '../mobx/RootStore';
import { StoreProvider } from '../mobx/store-context';
import { SAMPLE_TOKEN_BALANCE } from './utils/samples';
import WalletDrawer from '../components-v2/common/WalletDrawer';
import { customRender, screen, fireEvent } from './Utils';
import { TokenBalance } from '../mobx/model/tokens/token-balance';
import * as copy from 'copy-to-clipboard';

jest.mock('copy-to-clipboard', () => {
	return jest.fn().mockReturnValue(true);
});

describe('Wallet Drawer', () => {
	beforeEach(() => {
		store.uiState.showWalletDrawer = true;
		store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
		store.user.tokenBalances = {
			[SAMPLE_TOKEN_BALANCE.token.address]: TokenBalance.fromBalance(SAMPLE_TOKEN_BALANCE, '10000'),
		};
		jest.spyOn(OnboardStore.prototype, 'isActive').mockReturnValue(true);
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
