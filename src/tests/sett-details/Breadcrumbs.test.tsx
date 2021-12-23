import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { Breadcrumb } from '../../components-v2/vault-detail/Breadcrumb';
import { SAMPLE_SETT } from '../utils/samples';

describe('Breadcrumb', () => {
	it('displays sett breadcrumb', () => {
		checkSnapshot(<Breadcrumb vault={SAMPLE_SETT} />);
	});
});
