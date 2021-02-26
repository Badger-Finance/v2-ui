import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GasWidget from '../GasWidget';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('GasWidget', () => {
	test('Displays initial gas price', () => {
		render(
			<StoreProvider value={store}>
				<GasWidget />
			</StoreProvider>,
		);
		expect(screen.getByText(/(\d+)/i)).toBeVisible(); // Checks that gas price is rendered
	});

	test('Opens gas menu upon click', async () => {
		render(
			<StoreProvider value={store}>
				<GasWidget />
			</StoreProvider>,
		);
		await fireEvent.mouseDown(screen.getByText(/(\d+)/i));
		expect(screen.getByRole('presentation')).toBeInTheDocument; // DOM parent for open menu
		fireEvent.click(screen.getByDisplayValue('standard'));
	});
});
