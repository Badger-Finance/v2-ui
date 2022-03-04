import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { SAMPLE_BADGER_SETT, SAMPLE_VAULT, SAMPLE_VAULT_BALANCE, SAMPLE_TOKEN_BALANCE } from '../utils/samples';
import { Holdings } from '../../components-v2/vault-detail/holdings/Holdings';

describe('Breadcrumb', () => {
	it('displays holdings with no balance', () => {
		checkSnapshot(
			<Holdings
				vault={SAMPLE_VAULT}
				badgerVault={SAMPLE_BADGER_SETT}
				userData={SAMPLE_VAULT_BALANCE}
				tokenBalance={SAMPLE_TOKEN_BALANCE}
			/>,
		);
	});

	it('displays holdings with balance', () => {
		checkSnapshot(
			<Holdings
				vault={SAMPLE_VAULT}
				badgerVault={SAMPLE_BADGER_SETT}
				userData={SAMPLE_VAULT_BALANCE}
				tokenBalance={SAMPLE_TOKEN_BALANCE}
			/>,
		);
	});
});
