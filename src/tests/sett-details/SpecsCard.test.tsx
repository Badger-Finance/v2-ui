import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';
import { SettSpecs } from '../../components-v2/sett-detail/specs/SettSpecs';
import { SAMPLE_BADGER_SETT, SAMPLE_SETT } from '../utils/samples';
import { SettDetailMode } from '../../mobx/model/setts/sett-detail';

describe('Specs Section', () => {
	it('displays sett information', () => {
		checkSnapshot(
			<SettSpecs sett={SAMPLE_SETT} badgerSett={SAMPLE_BADGER_SETT} mode={SettDetailMode.settInformation} />,
		);
	});
});
