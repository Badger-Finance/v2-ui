import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { InformationCard } from '../../components-v2/sett-detail/information-card/InformationCard';

describe('Information Card', () => {
	it('displays sett information', () => {
		checkSnapshot(<InformationCard />);
	});
});
