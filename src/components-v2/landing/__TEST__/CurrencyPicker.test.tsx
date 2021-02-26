import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CurrencyPicker from '../CurrencyPicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('CurrencyPicker', () => {
	test('Renders and displays default currency', () => {
		const defaultCurrency = 'USD';
		render(
			<StoreProvider value={store}>
				<CurrencyPicker />
			</StoreProvider>,
		);
		expect(screen.getByText(defaultCurrency)).toBeVisible;
	});
	test('Opens menu upon click', async () => {
		const defaultCurrency = 'USD';
		render(
			<StoreProvider value={store}>
				<CurrencyPicker />
			</StoreProvider>,
		);
		await fireEvent.mouseDown(screen.getByText(defaultCurrency));
		const cad = await screen.findByText('CAD');
		expect(cad).toBeInTheDocument();
		const btc = await screen.findByText('BTC');
		expect(btc).toBeInTheDocument();
		const eth = await screen.findByText('ETH');
		expect(eth).toBeInTheDocument();
	});
});
