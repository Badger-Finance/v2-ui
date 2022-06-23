import '@testing-library/jest-dom';

import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { VaultWithdraw } from '../components-v2/common/dialogs/VaultWithdraw';
import store from '../mobx/stores/RootStore';
import { customRender } from './Utils';
import { SAMPLE_VAULT } from './utils/samples';

describe('Vault Withdraw', () => {
  test('displays sett information', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <VaultWithdraw open={true} vault={SAMPLE_VAULT} onClose={jest.fn()} />
      </StoreProvider>,
    );
    expect(baseElement).toMatchSnapshot();
  });
});
