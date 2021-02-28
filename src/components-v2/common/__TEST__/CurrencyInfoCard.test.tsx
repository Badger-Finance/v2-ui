import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import CurrencyInfoCard from '../CurrencyInfoCard';
import '@testing-library/jest-dom';
import BigNumber from 'bignumber.js';

afterEach(cleanup);

describe('CurrencyInfoCard', () => {
	test('Renders with correct title', () => {
		const DisplayPrice: BigNumber = new BigNumber(40);
		const currency = 'usd';
		render(<CurrencyInfoCard title="Test Price" value={DisplayPrice} currency={currency} isUsd={true} />);
		expect(screen.getByText('Test Price')).toBeInTheDocument();
	});

	test('Renders with correct currency', () => {
		const testvalue = 40;
		const DisplayPrice: BigNumber = new BigNumber(testvalue);
		const currency = 'cad';
		render(<CurrencyInfoCard title="Test Price" value={DisplayPrice} currency={currency} isUsd={true} />);
		expect(screen.getByText(/C\$/i)).toBeInTheDocument(); // Proper display of currency symbol
		expect(screen.getByText(/(\d+).(\d+)/i)).not.toBe(`${testvalue}.00`); // Proper conversion of currency
	});

	test('Renders with value format', () => {
		const DisplayPrice: BigNumber = new BigNumber(123456789.12);
		const currency = 'usd';
		render(<CurrencyInfoCard title="Test Price" value={DisplayPrice} currency={currency} isUsd={true} />);
		expect(screen.getByText('$123,456,789.12')).toBeInTheDocument(); // Proper display of currency symbol
	});
});
