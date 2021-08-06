import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { SpecsCard } from '../../components-v2/sett-detail/specs/SpecsCard';
import { SAMPLE_SETT } from './utils';

describe('Specs Section', () => {
	it('displays sett information', () => {
		checkSnapshot(<SpecsCard sett={SAMPLE_SETT} />);
	});
});
