import { VaultDTO, VaultState } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import VaultListDisplay from '../../components-v2/landing/VaultListDisplay';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import store from '../../mobx/stores/RootStore';
import UserStore from '../../mobx/stores/UserStore';
import VaultStore from '../../mobx/stores/VaultStore';
import { customRender } from '../Utils';
import { SAMPLE_VAULTS } from '../utils/samples';

const mockVaultsInformation = (vaults: VaultDTO[]) => {
  jest.spyOn(VaultStore.prototype, 'vaultsDefinitions', 'get').mockReturnValue(
    new Map(
      vaults.map((vault) => [
        vault.vaultToken,
        {
          depositToken: { address: vault.underlyingToken, decimals: 18 },
          vaultToken: { address: vault.vaultToken, decimals: 18 },
        },
      ]),
    ),
  );
};

describe('VaultListDisplay', () => {
  beforeEach(() => {
    mockVaultsInformation(SAMPLE_VAULTS);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    store.vaults.clearFilters();
  });

  it('displays empty search message', () => {
    mockVaultsInformation([]);
    jest
      .spyOn(VaultStore.prototype, 'vaultsFiltersCount', 'get')
      .mockReturnValue(1);

    const { container } = customRender(
      <StoreProvider value={store}>
        <VaultListDisplay />
      </StoreProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('displays no vaults message', () => {
    mockVaultsInformation([]);
    jest
      .spyOn(VaultStore.prototype, 'vaultsFiltersCount', 'get')
      .mockReturnValue(0);

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

    mockVaultsInformation(vaults);

    const { container } = customRender(
      <StoreProvider value={store}>
        <VaultListDisplay />
      </StoreProvider>,
    );

    expect(container).toMatchSnapshot();
  });

  it('uses default sort criteria by default', () => {
    const vaults = [...SAMPLE_VAULTS];

    mockVaultsInformation(vaults);

    jest
      .spyOn(UserStore.prototype, 'getBalance')
      .mockImplementation((address: string) => {
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
