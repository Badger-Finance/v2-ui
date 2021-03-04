import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import renderer from 'react-test-renderer';
import SamplePicker from '../SamplePicker';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

const { act } = renderer;

describe('SamplePicker', () => {
	const defaultPeriod = 'YEAR';
	const testStore = store;

	test('Renders correctly', () => {
		const rendered = renderer
			.create(
				<StoreProvider value={testStore}>
					<SamplePicker />
				</StoreProvider>,
			)
			.toJSON();
		expect(rendered).toMatchSnapshot();
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
		const month = await screen.findByText('MONTH');
		expect(month).toBeInTheDocument();
	});

	test('Displays info on hover', async () => {
		const defaultPeriod = 'YEAR';
		render(
			<StoreProvider value={testStore}>
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
