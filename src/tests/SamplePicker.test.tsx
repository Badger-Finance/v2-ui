import '@testing-library/jest-dom';

import { act, customRender, fireEvent, screen } from './Utils';

import React from 'react';
import SamplePicker from '../components-v2/landing/SamplePicker';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/store';

describe('SamplePicker', () => {
	const testStore = store;

	test('Renders correctly', () => {
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<SamplePicker />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Opens period menu upon click', async () => {
		customRender(
			<StoreProvider value={testStore}>
				<SamplePicker />
			</StoreProvider>,
		);
		act(() => {
			fireEvent.mouseDown(screen.getByRole('button'));
		});
		expect(await screen.findByRole('presentation')).toMatchSnapshot();
	});
});
