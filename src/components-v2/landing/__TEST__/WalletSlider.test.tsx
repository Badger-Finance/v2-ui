import React from 'react';
import { render, screen } from '@testing-library/react';
import WalletSlider from '../WalletSlider';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('WalletSlider', () => {
	test('Renders and displays default message', () => {
		render(
			<StoreProvider value={store}>
				<WalletSlider />
			</StoreProvider>,
		);
		expect(screen.getByText('Portfolio View')).toBeVisible;
	});
	// Clicking on slider produces changes in other part of the DOM, to be tested on integration (Landing.test.tsx)
});
