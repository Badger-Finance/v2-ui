import React from 'react';
import '@testing-library/jest-dom';
import { checkSnapshot } from './utils/snapshots';
import { AdvisoryType } from 'mobx/model/vaults/advisory-type';
import VaultAdvisory from 'components-v2/common/dialogs/VaultAdvisory';

describe('VaultAdvisory', () => {
	describe('Shows the proper vault advisory if one exists, or no advisory', () => {
		it.each([
			[AdvisoryType.ConvexLock],
			[AdvisoryType.Remuneration],
			[AdvisoryType.None],
			['Invalid'], // purposeful bad enum case
		])('Evaluates %s with %i decimals as %f', (advisoryType: string) => {
			checkSnapshot(<VaultAdvisory accept={() => {}} type={advisoryType as AdvisoryType} />);
		});
	});
});
