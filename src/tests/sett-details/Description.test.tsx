import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { Description } from '../../components-v2/sett-detail/description/Description';
import { SAMPLE_SETT } from './utils';

describe('Description', () => {
	it('displays sett description', () => {
		checkSnapshot(<Description sett={SAMPLE_SETT} />);
	});
});
