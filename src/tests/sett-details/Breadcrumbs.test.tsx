import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { Breadcrumb } from '../../components-v2/sett-detail/Breadcrumb';
import { SAMPLE_SETT } from './samples';

describe('Breadcrumb', () => {
	it('displays sett breadcrumb', () => {
		checkSnapshot(<Breadcrumb sett={SAMPLE_SETT} />);
	});
});
