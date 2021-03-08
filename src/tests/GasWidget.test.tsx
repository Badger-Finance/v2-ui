import React from 'react';
import { customRender, screen, fireEvent, act } from './Utils';
import GasWidget from '../components-v2/common/GasWidget';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/store';

describe('GasWidget', () => {
	const testStore = store;
	act(() => {
		testStore.wallet.gasPrices = { rapid: 122, standard: 75, slow: 51 };
	});

	test('Renders correctly', () => {
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<GasWidget />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
	test('Opens gas menu upon click and "rapid" is selected properly', async () => {
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<GasWidget />
			</StoreProvider>,
		);
		// Opens menu correctly
		await fireEvent.mouseDown(screen.getByRole('button', { name: '75' }));
		expect(await screen.getByRole('presentation')).toMatchSnapshot();

		// Selects 'rapid'
		await fireEvent.click(screen.getByRole('option', { name: '122' }));
		expect(container).toMatchSnapshot();
	});
});
