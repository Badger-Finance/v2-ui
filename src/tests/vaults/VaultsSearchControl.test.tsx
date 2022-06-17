import '@testing-library/jest-dom/extend-expect';

import { Protocol, VaultBehavior, VaultState } from '@badger-dao/sdk';
import { within } from '@testing-library/react';
import { action } from 'mobx';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';
import { config } from 'react-transition-group';

import VaultsSearchControls from '../../components-v2/VaultSearchControls';
import store from '../../mobx/stores/RootStore';
import VaultStore from '../../mobx/stores/VaultStore';
import { createMatchMedia, customRender, fireEvent, screen } from '../Utils';
import { checkSnapshot } from '../utils/snapshots';

describe('VaultSearchControl', () => {
	beforeEach(() => {
		jest.spyOn(VaultStore.prototype, 'vaultsProtocols', 'get').mockReturnValue([Protocol.Convex, Protocol.Curve]);
		jest.spyOn(VaultStore.prototype, 'networkHasBoostVaults', 'get').mockReturnValue(true);
		config.disabled = true;
	});

	describe('desktop', () => {
		it('renders correctly', () => {
			checkSnapshot(<VaultsSearchControls />);
		});

		it('can click checkbox filters', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			const onlyDepositsLabel = screen.getByRole('checkbox', { name: 'Only show deposits' });
			const hideDustLabel = screen.getByRole('checkbox', { name: 'Hide dust' });
			const boostedVaultsLabel = screen.getByRole('checkbox', { name: '🚀 Boosted Vaults' });

			fireEvent.click(onlyDepositsLabel);
			fireEvent.click(hideDustLabel);
			fireEvent.click(boostedVaultsLabel);

			expect(onlyDepositsLabel).toBeChecked();
			expect(hideDustLabel).toBeChecked();
			expect(boostedVaultsLabel).toBeChecked();
		});

		it('can select platforms', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			fireEvent.mouseDown(screen.getByLabelText('Platform'));
			fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: Protocol.Convex }));
			fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: Protocol.Curve }));
			expect(screen.getByTestId('platform-selector-input')).toHaveValue(Protocol.Convex + ',' + Protocol.Curve);
		});

		it('can select status', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			fireEvent.mouseDown(screen.getByLabelText('Status'));
			fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultState.Guarded }));
			fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultState.Experimental }));
			expect(screen.getByTestId('status-selector-input')).toHaveValue(
				VaultState.Guarded + ',' + VaultState.Experimental,
			);
		});

		it('can select rewards', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			fireEvent.mouseDown(screen.getByLabelText('Rewards'));
			fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultBehavior.DCA }));
			fireEvent.click(
				within(screen.getByRole('listbox')).getByRole('option', { name: VaultBehavior.Compounder }),
			);
			expect(screen.getByTestId('rewards-selector-input')).toHaveValue(
				VaultBehavior.DCA + ',' + VaultBehavior.Compounder,
			);
		});

		it('can type search', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			fireEvent.change(screen.getByRole('textbox', { name: 'Vault Search' }), {
				target: { value: 'bitcoin convex' },
			});

			expect(screen.getByDisplayValue('bitcoin convex')).toBeInTheDocument();
		});

		it('can select APY mode', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			const apyButton = screen.getByRole('button', { name: 'APY' });
			fireEvent.click(apyButton);
			expect(apyButton).toHaveAttribute('aria-selected', 'true');
		});

		it('can select APR mode', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			const aprButton = screen.getByRole('button', { name: 'APR' });
			fireEvent.click(aprButton);
			expect(aprButton).toHaveAttribute('aria-selected', 'true');
		});

		it('can select USD currency', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			const usdButton = screen.getByRole('button', { name: 'USD' });
			fireEvent.click(usdButton);
			expect(usdButton).toHaveAttribute('aria-selected', 'true');
		});

		it('can select BTC currency', () => {
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);

			const btcButton = screen.getByRole('button', { name: 'BTC' });
			fireEvent.click(btcButton);
			expect(btcButton).toHaveAttribute('aria-selected', 'true');
		});

		it('can clear filters', () => {
			const clear = jest.fn();
			store.vaults.clearFilters = action(clear);
			customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);
			fireEvent.click(screen.getByRole('button', { name: /Clear All/i }));
			expect(clear).toHaveBeenCalledTimes(1);
		});
	});

	describe('mobile', () => {
		beforeEach(() => {
			window.matchMedia = createMatchMedia(480);
		});

		it('renders correctly', () => {
			checkSnapshot(<VaultsSearchControls />);
		});

		it('opens filter dialog', () => {
			const { baseElement } = customRender(
				<StoreProvider value={store}>
					<VaultsSearchControls />
				</StoreProvider>,
			);
			fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
			expect(baseElement).toMatchSnapshot();
		});
	});
});
