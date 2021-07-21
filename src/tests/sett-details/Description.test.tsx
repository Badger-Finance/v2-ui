import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { Description } from '../../components-v2/sett-detail/Description';

describe('Description', () => {
	it('displays sett description', () => {
		checkSnapshot(<Description />);
	});
});
