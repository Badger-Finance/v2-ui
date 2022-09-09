import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { VaultDeposit } from '../components-v2/common/dialogs/VaultDeposit';
import store from '../mobx/stores/RootStore';
import { customRender, screen } from './Utils';
import { SAMPLE_VAULT } from './utils/samples';

describe('Vault Deposit', () => {
  test('displays sett information', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <VaultDeposit open={true} vault={SAMPLE_VAULT} onClose={jest.fn()} />
      </StoreProvider>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('can see full fees descriptions', () => {
    const vault = { ...SAMPLE_VAULT };
    vault.strategy.strategistFee = 0.3;
    vault.strategy.address = '0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541';
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <VaultDeposit open={true} vault={vault} onClose={jest.fn()} />
      </StoreProvider>,
    );
    userEvent.click(screen.getAllByTitle(/click to see full description/i)[0]);
    expect(baseElement).toMatchSnapshot();
  });

  test('can go back from full fees descriptions', () => {
    const vault = { ...SAMPLE_VAULT };
    vault.strategy.strategistFee = 0.3;
    vault.strategy.address = '0x9BE89D2a4cd102D8Fecc6BF9dA793be995C22541';
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <VaultDeposit open={true} vault={vault} onClose={jest.fn()} />
      </StoreProvider>,
    );
    userEvent.click(screen.getAllByTitle(/click to see full description/i)[0]);
    userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(baseElement).toMatchSnapshot();
  });
});
