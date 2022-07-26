import copy from 'copy-to-clipboard';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import InvalidCycleDialog from '../components-v2/common/dialogs/InvalidCycleDialog';
import store from '../mobx/stores/RootStore';
import { customRender, fireEvent, screen } from './Utils';

jest.mock('copy-to-clipboard');

describe('InvalidCycleDialog', () => {
  beforeEach(() => {
    store.wallet.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
    store.tree.cycle = 123;
  });

  it('displays invalid cycle dialog', () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>
        <InvalidCycleDialog open={true} onClose={jest.fn()} />
      </StoreProvider>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('can copy cycle to clipboard', () => {
    customRender(
      <StoreProvider value={store}>
        <InvalidCycleDialog open={true} onClose={jest.fn()} />
      </StoreProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'copy to clipboard' }));
    expect(copy).toHaveBeenCalledWith('123');
  });
});
