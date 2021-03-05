import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SamplePicker from '../SamplePicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('SamplePicker', () => {
	const defaultPeriod = 'YEAR';
	const testStore = store;

	test('Renders correctly', () => {
		const { container } = render(
			<StoreProvider value={testStore}>
				<SamplePicker />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Opens period menu upon click', async () => {
		render(
			<StoreProvider value={testStore}>
				<SamplePicker />
			</StoreProvider>,
		);
		act(() => {
			fireEvent.mouseDown(screen.getByText(defaultPeriod));
		});
		const menu = await screen.findByRole('presentation');
		expect(menu).toMatchSnapshot();
	});
});
