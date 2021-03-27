import '@testing-library/jest-dom';

import BigNumber from 'bignumber.js';
import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import React from 'react';
import { customRender } from './Utils';

describe('CurrencyInfoCard', () => {
	test('Renders correctly', () => {
		const displayPrice = new BigNumber(40);
		const currency = 'usd';
		const { container } = customRender(
			<CurrencyInfoCard title="Test Price" value={displayPrice} currency={currency} isUsd={true} />,
		);
		expect(container).toMatchSnapshot();
	});
});
