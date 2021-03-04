import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import renderer from 'react-test-renderer';
import CurrencyPicker from '../CurrencyPicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

const { act } = renderer;

describe('CurrencyPicker', () => {
	const testStore = store;

	test('Renders correctly', () => {
		const rendered = renderer
			.create(
				<StoreProvider value={testStore}>
					<CurrencyPicker />
				</StoreProvider>,
			)
			.toJSON();
		expect(rendered).toMatchSnapshot();
	});
	test('Opens menu upon click', async () => {
		const defaultCurrency = 'USD';
		render(
			<StoreProvider value={testStore}>
				<CurrencyPicker />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.mouseDown(screen.getByText(defaultCurrency));
		});
		const cad = await screen.findByText('CAD');
		expect(cad).toBeInTheDocument();
		const btc = await screen.findByText('BTC');
		expect(btc).toBeInTheDocument();
		const eth = await screen.findByText('ETH');
		expect(eth).toBeInTheDocument();
	});
});
