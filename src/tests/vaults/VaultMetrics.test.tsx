import React from 'react';
import { checkSnapshot } from '../utils/snapshots';
import VaultMetrics from '../../components-v2/vault-detail/specs/VaultMetrics';
import { SAMPLE_VAULT } from '../utils/samples';
import LockedDepositsStore from '../../mobx/stores/LockedDepositsStore';
import { TokenBalance } from '../../mobx/model/tokens/token-balance';
import BigNumber from 'bignumber.js';

describe('VaultMetrics', () => {
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
				new BigNumber(100 * 1e18),
				new BigNumber(0),
			),
		);
		checkSnapshot(<VaultMetrics vault={SAMPLE_VAULT} />);
	});
});
