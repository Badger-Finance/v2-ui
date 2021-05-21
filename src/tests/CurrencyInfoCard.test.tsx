import React from 'react';
import CurrencyInfoCard from '../components-v2/common/CurrencyInfoCard';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';
import { customRender } from './Utils';

describe('CurrencyInfoCard', () => {
	test('Renders correctly', () => {
		const displayPrice = new BigNumber(1);
		const currency = 'usd';
		const { container } = customRender(
			<CurrencyInfoCard title="Test Price" value={displayPrice} currency={currency} />,
		);
		expect(container).toMatchSnapshot();
	});
});
