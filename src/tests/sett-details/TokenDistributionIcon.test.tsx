import userEvent from '@testing-library/user-event';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { TokenDistributionIcon } from '../../components-v2/vault-detail/holdings/TokenDistributionIcon';
import store from '../../mobx/stores/RootStore';
import { customRender, screen } from '../Utils';
import { SAMPLE_VAULT_BALANCE } from '../utils/samples';

describe('Token Distribution Icon', () => {
  it('displays sett token distribution information on hover', async () => {
    const { baseElement } = customRender(
      <StoreProvider value={store}>{<TokenDistributionIcon settBalance={SAMPLE_VAULT_BALANCE} />}</StoreProvider>,
    );
    userEvent.hover(screen.getByLabelText('sett token distribution'));
    await screen.findByText(SAMPLE_VAULT_BALANCE.tokens[0].symbol);
    expect(baseElement).toMatchSnapshot();
  });
});
