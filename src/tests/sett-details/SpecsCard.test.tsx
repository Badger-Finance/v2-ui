import SpecsCard from 'components-v2/vault-detail/specs/SpecsCard';
import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { SAMPLE_BADGER_SETT, SAMPLE_VAULT } from '../utils/samples';
import VaultStore from '../../mobx/stores/VaultStore';

describe('Specs Section', () => {
	it('displays sett information', () => {
		jest.spyOn(VaultStore.prototype, 'getVaultDefinition').mockReturnValue({
			depositToken: { address: SAMPLE_VAULT.underlyingToken, decimals: 18 },
			vaultToken: { address: SAMPLE_VAULT.vaultToken, decimals: 18 },
		});
		checkSnapshot(<SpecsCard vault={SAMPLE_VAULT} badgerVault={SAMPLE_BADGER_SETT} />);
	});
});
