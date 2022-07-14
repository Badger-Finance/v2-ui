import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';

import { Holdings } from '../../components-v2/vault-detail/holdings/Holdings';
import UserStore from '../../mobx/stores/UserStore';
import { SAMPLE_TOKEN_BALANCE, SAMPLE_VAULT, SAMPLE_VAULT_BALANCE } from '../utils/samples';

describe('Holdings', () => {
  beforeEach(() => {
    jest.spyOn(UserStore.prototype, 'getBalance').mockReturnValue(SAMPLE_TOKEN_BALANCE);
  });

  it('displays holdings with no balance', () => {
    checkSnapshot(
      <Holdings
        vault={SAMPLE_VAULT}
        userData={SAMPLE_VAULT_BALANCE}
        onDepositClick={jest.fn()}
        onWithdrawClick={jest.fn()}
      />,
    );
  });

  it('displays holdings with balance', () => {
    jest.spyOn(UserStore.prototype, 'getBalance').mockReturnValue(SAMPLE_TOKEN_BALANCE);
    checkSnapshot(
      <Holdings
        vault={SAMPLE_VAULT}
        userData={SAMPLE_VAULT_BALANCE}
        onDepositClick={jest.fn()}
        onWithdrawClick={jest.fn()}
      />,
    );
  });
});
