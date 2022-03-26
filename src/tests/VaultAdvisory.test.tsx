import React from 'react';
import '@testing-library/jest-dom';
import { checkSnapshot } from './utils/snapshots';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import VaultAdvisory from 'components-v2/common/dialogs/VaultAdvisory';
import { SAMPLE_VAULT } from './utils/samples';

describe('VaultAdvisory', () => {
	describe('Shows the proper vault advisory if one exists, or no advisory', () => {
		it.each([
			[AdvisoryType.ConvexLock],
			[AdvisoryType.Remuneration],
			[AdvisoryType.Chadger],
			[AdvisoryType.None],
			['Invalid'], // purposeful bad enum case
		])('Displays the expected %s vault advisory', (advisoryType: string) => {
			checkSnapshot(<VaultAdvisory vault={SAMPLE_VAULT} accept={() => {}} type={advisoryType as AdvisoryType} />);
		});
	});
});
