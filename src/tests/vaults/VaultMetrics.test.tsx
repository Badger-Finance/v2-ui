import { utils } from 'ethers';
import React from 'react';

import VaultMetrics from '../../components-v2/vault-detail/specs/VaultMetrics';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import LockedDepositsStore from '../../mobx/stores/LockedDepositsStore';
import { SAMPLE_VAULT } from '../utils/samples';
import { checkSnapshot } from '../utils/snapshots';

describe('VaultMetrics', () => {
  beforeEach(() => {
    const dateString = new Date(0).toLocaleString('en-US', {
      timeZone: 'America/New_York',
    });
    jest.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(dateString);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly', () => {
    checkSnapshot(<VaultMetrics vault={SAMPLE_VAULT} />);
  });

  it('displays withdrawable tokens', () => {
    jest.spyOn(LockedDepositsStore.prototype, 'getLockedDepositBalances').mockReturnValue(
      new TokenBalance(
        {
          address: SAMPLE_VAULT.vaultToken,
          symbol: SAMPLE_VAULT.vaultAsset,
          name: SAMPLE_VAULT.name,
          decimals: 18,
        },
        utils.parseEther('100'),
        0,
      ),
    );
    checkSnapshot(<VaultMetrics vault={{ ...SAMPLE_VAULT }} />);
  });
});
