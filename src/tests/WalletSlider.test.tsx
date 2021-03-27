import '@testing-library/jest-dom';

import React from 'react';
import { StoreProvider } from '../mobx/store-context';
import WalletSlider from '../components-v2/landing/WalletSlider';
import { customRender } from './Utils';
import store from '../mobx/store';

describe('WalletSlider', () => {
	const testStore = store;
	test('Renders correctly', () => {
		const { container } = customRender(
			<StoreProvider value={testStore}>
				<WalletSlider />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
	// Clicking on slider produces changes in other part of the DOM, to be tested on integration (Landing.test.tsx)
});
