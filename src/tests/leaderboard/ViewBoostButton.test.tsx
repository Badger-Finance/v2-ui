import ViewBoostButton from 'components-v2/leaderboard/ViewBoostButton';
import React from 'react';
import { verifyComponent } from 'tests/utils/snapshots';

describe('ViewBoostButton', () => {
	describe('No user connected', () => {
		it('Displays a button to connect wallet', () => verifyComponent(<ViewBoostButton />));
	});

	describe('User connected', () => {
		it('Displays a button to calculate boost', () => {
			verifyComponent(<ViewBoostButton />);
		});
	});
});
