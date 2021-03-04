import React from 'react';
import renderer from 'react-test-renderer';
import WalletSlider from '../WalletSlider';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('WalletSlider', () => {
	const testStore = store;
	test('Renders correctly', () => {
		const rendered = renderer
			.create(
				<StoreProvider value={testStore}>
					<WalletSlider />
				</StoreProvider>,
			)
			.toJSON();
		expect(rendered).toMatchSnapshot();
	});
	// Clicking on slider produces changes in other part of the DOM, to be tested on integration (Landing.test.tsx)
});
