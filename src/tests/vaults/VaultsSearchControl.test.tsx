import '@testing-library/jest-dom/extend-expect';

import { Network, Protocol, VaultBehavior, VaultState } from '@badger-dao/sdk';
import { within } from '@testing-library/react';
import { action } from 'mobx';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';
import { config } from 'react-transition-group';

import VaultsSearchControls from '../../components-v2/VaultSearchControls';
import store from '../../mobx/stores/RootStore';
import { createMatchMedia, customRender, fireEvent, screen } from '../Utils';
import { SAMPLE_VAULTS } from '../utils/samples';
import { checkSnapshot } from '../utils/snapshots';

describe('VaultSearchControl', () => {
  beforeEach(() => {
    const vaults = [...SAMPLE_VAULTS];
    vaults[0].boost.enabled = true;
    vaults[0].protocol = Protocol.Convex;
    vaults[1].protocol = Protocol.Curve;
    store.vaults.vaultCache = {
      [Network.Ethereum]: Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault])),
    };
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
          <VaultsSearchControls />
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
          <VaultsSearchControls />
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
          <VaultsSearchControls />
        </StoreProvider>,
      );

      fireEvent.change(screen.getByRole('textbox', { name: 'Vault Search' }), {
        target: { value: 'bitcoin convex' },
      });

      expect(screen.getByDisplayValue('bitcoin convex')).toBeInTheDocument();
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
