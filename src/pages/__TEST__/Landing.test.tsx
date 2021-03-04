import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Landing from '../Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../mobx/store-context';
import store from '../../mobx/store';

afterEach(cleanup);
const { act } = renderer;

describe('Landing Page', () => {
	const connectedStore = store;
	act(() => {
		connectedStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
	});

	test('Renders correctly', () => {
		const rendered = renderer
			.create(
				<StoreProvider value={connectedStore}>
					<Landing />
				</StoreProvider>,
			)
			.toJSON();
		expect(rendered).toMatchSnapshot();
	});

	test('Clicking portfolio switch shows empty portfolio', async () => {
		const { getByText, findByText } = render(
			<StoreProvider value={connectedStore}>
				<Landing />
			</StoreProvider>,
		);
		// Clicks on switch
		await act(async () => {
			await fireEvent.click(getByText('Portfolio View'));
		});
		// Checks for display of empty portfolio message
		const currency = await findByText('Your address does not have tokens to deposit.');
		expect(currency).toBeVisible;
	});
	// TODO: Create a mock Web3 provider to emulate connection and test further interactions
	/* 
	test('Selecting different currency changes displayed currency', async () => {
		store.wallet.connectedAddress = '';
		const { getByRole, findByText } = render(
			<StoreProvider value={store}>
				<Landing />
			</StoreProvider>,
		);
		// Opens currency menu
		await fireEvent.mouseDown(getByRole('button', { name: defaultCurrency }));

		// Checks that CAD is in menu
		const currency = await findByText('CAD');
		expect(currency).toBeVisible;

		// Selects CAD
		await fireEvent.click(currency);

		// Finds ocurrance of C$
		const ocurrance = await findByText(/C\$/i);
		expect(ocurrance).toBeVisible;
	}); */
});
