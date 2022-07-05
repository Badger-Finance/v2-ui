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
        <VaultDeposit open={true} vault={SAMPLE_VAULT} />
      </StoreProvider>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  test('can see full fees descriptions', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <VaultDeposit open={true} vault={SAMPLE_VAULT} />
      </StoreProvider>,
    );
    userEvent.click(screen.getByTitle('Click to see full description'));
    expect(baseElement).toMatchSnapshot();
  });

  test('can go back from full fees descriptions', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <VaultDeposit open={true} vault={SAMPLE_VAULT} />
      </StoreProvider>,
    );
    userEvent.click(screen.getByTitle('Click to see full description'));
    userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(baseElement).toMatchSnapshot();
  });
});
