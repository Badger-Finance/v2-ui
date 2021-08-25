import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT, SAMPLE_SETT_BALANCE } from '../utils/samples';
import { Holdings } from '../../components-v2/sett-detail/holdings/Holdings';

describe('Breadcrumb', () => {
	it('displays holdings with no balance', () => {
		checkSnapshot(<Holdings sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} />);
	});

	it('displays holdings with balance', () => {
		checkSnapshot(
			<Holdings sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} settBalance={SAMPLE_SETT_BALANCE} />,
		);
	});
});
