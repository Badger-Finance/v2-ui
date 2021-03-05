import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CurrencyPicker from '../CurrencyPicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('CurrencyPicker', () => {
	const testStore = store;

	test('Renders correctly', () => {
		const { container } = render(
			<StoreProvider value={testStore}>
				<CurrencyPicker />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
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
		const opennedMenu = await screen.getByRole('presentation');
		expect(opennedMenu).toMatchSnapshot();
	});
});
