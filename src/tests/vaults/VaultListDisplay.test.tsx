import { BadgerAPI, Network, VaultState } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import VaultListDisplay from '../../components-v2/landing/VaultListDisplay';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import store from '../../mobx/stores/RootStore';
import UserStore from '../../mobx/stores/UserStore';
import { customRender } from '../Utils';
import { SAMPLE_VAULTS } from '../utils/samples';

describe('VaultListDisplay', () => {
  beforeEach(() => {
    store.vaults.initialized = true;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('displays empty search message', async () => {
    const vaults = [...SAMPLE_VAULTS];
    store.vaults.vaultCache = {
      [Network.Ethereum]: Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault])),
    };

    store.vaults.vaultsFilters.search = 'wont-find-this';

    jest.spyOn(BadgerAPI.prototype, 'loadProtocolSummary').mockImplementation(() =>
      Promise.resolve({
        totalValue: 0,
        setts: [],
      }),
    );

    const { container } = customRender(
      <StoreProvider value={store}>
        <VaultListDisplay />
      </StoreProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('displays no vaults message', () => {
    store.vaults.clearFilters();

    store.vaults.vaultCache = {
      [Network.Ethereum]: {},
    };

    const { container } = customRender(
      <StoreProvider value={store}>
        <VaultListDisplay />
      </StoreProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('does not display deprecated vaults with no user balance', () => {
    const vaults = [...SAMPLE_VAULTS].splice(0, 1);
    vaults[0].state = VaultState.Discontinued;

    store.vaults.vaultCache = {
      [Network.Ethereum]: Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault])),
    };

    const { container } = customRender(
      <StoreProvider value={store}>
        <VaultListDisplay />
      </StoreProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('uses default sort criteria by default', () => {
    const vaults = [...SAMPLE_VAULTS];

    store.vaults.vaultCache = {
      [Network.Ethereum]: Object.fromEntries(vaults.map((vault) => [vault.vaultToken, vault])),
    };

    jest.spyOn(UserStore.prototype, 'getBalance').mockImplementation((address: string) => {
      if (address === vaults[2].vaultToken) {
        return new TokenBalance(
          {
            address,
            symbol: '',
            decimals: 18,
            name: '',
          },
          BigNumber.from(10),
          2,
        );
      }

      if (address === vaults[1].underlyingToken) {
        return new TokenBalance(
          {
            address,
            symbol: '',
            decimals: 18,
            name: '',
          },
          BigNumber.from(1),
          2,
        );
      }

      return new TokenBalance(
        {
          address,
          symbol: '',
          decimals: 18,
          name: '',
        },
        BigNumber.from(0),
        0,
      );
    });

    const { container } = customRender(
      <StoreProvider value={store}>
        <VaultListDisplay />
      </StoreProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
