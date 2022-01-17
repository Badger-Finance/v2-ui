import React from 'react';
import { VaultState } from '@badger-dao/sdk';
import { checkSnapshot } from '../utils/snapshots';
import VaultBadge from '../../components-v2/landing/VaultBadge';

describe('VaultTag', () => {
	test.each([...Object.values(VaultState)])('%p Vaults', (state) => {
		checkSnapshot(<VaultBadge state={state} />);
	});
});
