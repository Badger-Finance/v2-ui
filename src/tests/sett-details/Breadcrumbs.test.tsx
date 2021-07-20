import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { Breadcrumb } from '../../components-v2/sett-detail/Breadcrumb';

describe('Breadcrumb', () => {
	it('displays sett breadcrumb', () => {
		checkSnapshot(<Breadcrumb />);
	});
});
