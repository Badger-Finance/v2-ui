import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SamplePicker from '../SamplePicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('SamplePicker', () => {
	const defaultPeriod = 'YEAR';

	test('Renders and displays default period', () => {
		render(
			<StoreProvider value={store}>
				<SamplePicker />
			</StoreProvider>,
		);
		expect(screen.getByText(defaultPeriod)).toBeVisible; // Checks that picker is rendered with default currency
	});

	test('Opens period menu upon click', async () => {
		render(
			<StoreProvider value={store}>
				<SamplePicker />
			</StoreProvider>,
		);
		act(() => {
			fireEvent.mouseDown(screen.getByText(defaultPeriod));
		});
		const month = await screen.findByText('MONTH');
		expect(month).toBeInTheDocument();
	});

	test('Displays info on hover', async () => {
		const defaultPeriod = 'YEAR';
		render(
			<StoreProvider value={store}>
				<SamplePicker />
			</StoreProvider>,
		);
		act(() => {
			fireEvent.mouseOver(screen.getByText(defaultPeriod));
		});
		const message = await screen.findByRole('tooltip'); // DOM parent object for info message
		expect(message).toBeInTheDocument();
	});
});
