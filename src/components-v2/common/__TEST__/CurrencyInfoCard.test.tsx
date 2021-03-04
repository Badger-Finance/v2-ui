import React from 'react';
import CurrencyInfoCard from '../CurrencyInfoCard';
import '@testing-library/jest-dom';
import renderer from 'react-test-renderer';
import BigNumber from 'bignumber.js';

describe('CurrencyInfoCard', () => {
	test('Renders correctly', () => {
		const DisplayPrice = new BigNumber(40);
		const currency = 'usd';
		const rendered = renderer
			.create(<CurrencyInfoCard title="Test Price" value={DisplayPrice} currency={currency} isUsd={true} />)
			.toJSON();
		expect(rendered).toMatchSnapshot();
	});
});
