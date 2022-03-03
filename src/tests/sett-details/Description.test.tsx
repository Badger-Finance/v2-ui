import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { Description } from '../../components-v2/vault-detail/description/Description';
import { SAMPLE_VAULT } from '../utils/samples';

describe('Description', () => {
	it('displays sett description', () => {
		checkSnapshot(<Description vault={SAMPLE_VAULT} />);
	});
});
