import '@testing-library/jest-dom/extend-expect';

import { Network, Protocol, VaultBehavior, VaultState } from '@badger-dao/sdk';
import { within } from '@testing-library/react';
import UserEvent from '@testing-library/user-event';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';
import { config } from 'react-transition-group';

import VaultFiltersDialogV2 from '../../components-v2/VaultSearchControls/VaultFiltersDialog';
import store from '../../mobx/stores/RootStore';
import VaultStore from '../../mobx/stores/VaultStore';
import { customRender, fireEvent, screen } from '../Utils';
import { SAMPLE_VAULTS } from '../utils/samples';

describe('VaultFiltersDialog', () => {
  beforeEach(() => {
    const vaults = [...SAMPLE_VAULTS];
    vaults[0].boost.enabled = true;
    vaults[0].protocol = Protocol.Convex;
    vaults[1].protocol = Protocol.Curve;
    store.vaults.vaultCache = {
      [Network.Ethereum]: Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault])),
    };
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

    const onlyDepositsLabel = screen.getByRole('checkbox', {
      name: 'Only show deposits',
    });
    const hideDustLabel = screen.getByRole('checkbox', { name: 'Hide dust' });
    const boostedVaultsLabel = screen.getByRole('checkbox', {
      name: '🚀 Boosted Vaults',
    });

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
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: Protocol.Convex,
      }),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: Protocol.Curve,
      }),
    );
    expect(screen.getByTestId('platform-selector-input')).toHaveValue(Protocol.Convex + ',' + Protocol.Curve);
  });

  it('can select status', () => {
    customRender(
      <StoreProvider value={store}>
        <VaultFiltersDialogV2 />
      </StoreProvider>,
    );

    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultState.Guarded,
      }),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultState.Experimental,
      }),
    );
    expect(screen.getByTestId('status-selector-input')).toHaveValue(VaultState.Guarded + ',' + VaultState.Experimental);
  });

  it('can select rewards', () => {
    customRender(
      <StoreProvider value={store}>
        <VaultFiltersDialogV2 />
      </StoreProvider>,
    );

    fireEvent.mouseDown(screen.getByLabelText('Rewards'));
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultBehavior.DCA,
      }),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultBehavior.Compounder,
      }),
    );
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
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: Protocol.Convex,
      }),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: Protocol.Curve,
      }),
    );
    UserEvent.type(screen.getByRole('listbox'), '{esc}');

    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultState.Guarded,
      }),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultState.Experimental,
      }),
    );
    UserEvent.type(screen.getByRole('listbox'), '{esc}');

    fireEvent.mouseDown(screen.getByLabelText('Rewards'));
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultBehavior.DCA,
      }),
    );
    fireEvent.click(
      within(screen.getByRole('listbox')).getByRole('option', {
        name: VaultBehavior.Compounder,
      }),
    );
    UserEvent.type(screen.getByRole('listbox'), '{esc}');

    fireEvent.change(screen.getByRole('textbox', { name: 'Vault Search' }), {
      target: { value: 'bitcoin convex' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply Filters' }));

    expect(store.vaults.vaultsFilters).toMatchSnapshot();
  });
});
