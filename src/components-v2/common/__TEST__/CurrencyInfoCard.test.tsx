import React from 'react';
import CurrencyInfoCard from '../CurrencyInfoCard';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';
import { render } from '@testing-library/react';

describe('CurrencyInfoCard', () => {
	test('Renders correctly', () => {
		const displayPrice = new BigNumber(40);
		const currency = 'usd';
		const { container } = render(
			<CurrencyInfoCard title="Test Price" value={displayPrice} currency={currency} isUsd={true} />,
		);
		expect(container).toMatchSnapshot();
	});
});
