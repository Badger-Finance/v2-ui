import ViewBoostButton from 'components-v2/leaderboard/ViewBoostButton';
import React from 'react';
import { checkSnapshot } from 'tests/utils/snapshots';

describe('ViewBoostButton', () => {
	describe('No user connected', () => {
		it('Displays a button to connect wallet', () => checkSnapshot(<ViewBoostButton />));
	});

	describe('User connected', () => {
		it('Displays a button to calculate boost', () => {
			checkSnapshot(<ViewBoostButton />);
		});
	});
});
