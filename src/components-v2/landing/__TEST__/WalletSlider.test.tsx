import React from 'react';
import WalletSlider from '../WalletSlider';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('WalletSlider', () => {
	const testStore = store;
	test('Renders correctly', () => {
		const { container } = render(
			<StoreProvider value={testStore}>
				<WalletSlider />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});
	// Clicking on slider produces changes in other part of the DOM, to be tested on integration (Landing.test.tsx)
});
