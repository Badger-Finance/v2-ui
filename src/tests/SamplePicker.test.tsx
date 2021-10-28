import React from 'react';
import { customRender, screen, fireEvent, act } from './Utils';
import SamplePicker from '../components-v2/landing/SamplePicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/RootStore';
import { checkSnapshot } from './utils/snapshots';

describe('SamplePicker', () => {
	const testStore = store;

	test('Renders correctly', () => checkSnapshot(<SamplePicker />));

	test('Opens period menu upon click', async () => {
		customRender(
			<StoreProvider value={testStore}>
				<SamplePicker />
			</StoreProvider>,
		);
		await act(async () => {
			await fireEvent.mouseDown(screen.getByRole('button'));
		});
		expect(await screen.findByRole('presentation')).toMatchSnapshot();
	});
});
