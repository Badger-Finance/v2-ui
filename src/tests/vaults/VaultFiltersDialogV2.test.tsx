import React from 'react';
import store from '../../mobx/RootStore';
import { customRender, fireEvent, screen } from '../Utils';
import VaultFiltersDialogV2 from '../../components-v2/VaultSearchControls/VaultFiltersDialogV2';
import { StoreProvider } from '../../mobx/store-context';
import VaultStore from '../../mobx/stores/VaultStore';
import '@testing-library/jest-dom/extend-expect';
import { Protocol, VaultBehavior, VaultState } from '@badger-dao/sdk';
import { within } from '@testing-library/react';
import { config } from 'react-transition-group';
import UserEvent from '@testing-library/user-event';
import * as ENVIRONMENT from '../../config/environment';

describe('VaultFiltersDialogV2', () => {
	beforeEach(() => {
		jest.spyOn(VaultStore.prototype, 'vaultsProtocols', 'get').mockReturnValue([Protocol.Convex, Protocol.Curve]);
		jest.spyOn(VaultStore.prototype, 'networkHasBoostVaults', 'get').mockReturnValue(true);
		ENVIRONMENT.FLAGS.VAULT_FILTERS_V2 = true;
		store.vaults.showVaultFilters = true;
		config.disabled = true;
	});

	it('renders correctly', () => {
		const { baseElement } = customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);
		expect(baseElement).toMatchSnapshot();
	});

	it('can click checkbox filters', () => {
		customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
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
				<VaultFiltersDialogV2 />
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
				<VaultFiltersDialogV2 />
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
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);

		fireEvent.mouseDown(screen.getByLabelText('Rewards'));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultBehavior.DCA }));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultBehavior.Compounder }));
		expect(screen.getByTestId('rewards-selector-input')).toHaveValue(
			VaultBehavior.DCA + ',' + VaultBehavior.Compounder,
		);
	});

	it('can type search', () => {
		customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
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
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);

		const apyButton = screen.getByRole('button', { name: 'APY' });
		fireEvent.click(apyButton);
		expect(apyButton).toHaveAttribute('aria-selected', 'true');
	});

	it('can select APR mode', () => {
		customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);

		const aprButton = screen.getByRole('button', { name: 'APR' });
		fireEvent.click(aprButton);
		expect(aprButton).toHaveAttribute('aria-selected', 'true');
	});

	it('can select USD currency', () => {
		customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);

		const usdButton = screen.getByRole('button', { name: 'USD' });
		fireEvent.click(usdButton);
		expect(usdButton).toHaveAttribute('aria-selected', 'true');
	});

	it('can select BTC currency', () => {
		customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);

		const btcButton = screen.getByRole('button', { name: 'BTC' });
		fireEvent.click(btcButton);
		expect(btcButton).toHaveAttribute('aria-selected', 'true');
	});

	it('can apply filters', async () => {
		jest.spyOn(VaultStore.prototype, 'networkHasBoostVaults', 'get').mockReturnValue(true);
		jest.spyOn(VaultStore.prototype, 'vaultsProtocols', 'get').mockReturnValue([Protocol.Convex, Protocol.Curve]);

		customRender(
			<StoreProvider value={store}>
				<VaultFiltersDialogV2 />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByRole('checkbox', { name: 'Only show deposits' }));
		fireEvent.click(screen.getByRole('checkbox', { name: 'Hide dust' }));
		fireEvent.click(screen.getByRole('checkbox', { name: '🚀 Boosted Vaults' }));

		fireEvent.mouseDown(screen.getByLabelText('Platform'));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: Protocol.Convex }));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: Protocol.Curve }));
		UserEvent.type(screen.getByRole('listbox'), '{esc}');

		fireEvent.mouseDown(screen.getByLabelText('Status'));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultState.Guarded }));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultState.Experimental }));
		UserEvent.type(screen.getByRole('listbox'), '{esc}');

		fireEvent.mouseDown(screen.getByLabelText('Rewards'));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultBehavior.DCA }));
		fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: VaultBehavior.Compounder }));
		UserEvent.type(screen.getByRole('listbox'), '{esc}');

		fireEvent.change(screen.getByRole('textbox', { name: 'Vault Search' }), {
			target: { value: 'bitcoin convex' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'APR' }));
		fireEvent.click(screen.getByRole('button', { name: 'BTC' }));
		fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

		expect(store.vaults.vaultsFiltersV2).toMatchSnapshot();
	});
});