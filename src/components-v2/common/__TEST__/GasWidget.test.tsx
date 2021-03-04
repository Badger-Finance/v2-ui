import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import renderer from 'react-test-renderer';
import GasWidget from '../GasWidget';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

describe('GasWidget', () => {
	const testStore = store;

	test('Renders correctly', () => {
		const rendered = renderer
			.create(
				<StoreProvider value={testStore}>
					<GasWidget />
				</StoreProvider>,
			)
			.toJSON();
		expect(rendered).toMatchSnapshot();
	});
	test('Opens gas menu upon click', async () => {
		render(
			<StoreProvider value={testStore}>
				<GasWidget />
			</StoreProvider>,
		);
		await fireEvent.mouseDown(screen.getByText(/(\d+)/i));
		expect(screen.getByRole('presentation')).toBeInTheDocument; // DOM parent for open menu
		fireEvent.click(screen.getByDisplayValue('standard'));
	});
});
