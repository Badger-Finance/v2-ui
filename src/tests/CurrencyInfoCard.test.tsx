import '@testing-library/jest-dom';

import React from 'react';

import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import { checkSnapshot } from './utils/snapshots';

describe('CurrencyInfoCard', () => {
	test('Renders correctly', () => {
		const displayPrice = new BigNumber(1);
		checkSnapshot(<CurrencyInfoCard title="Test Price" value={displayPrice} />);
	});
});
