import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import Landing from '../Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../../mobx/store-context';
import store from '../../mobx/store';

afterEach(cleanup);

describe('Landing Page', () => {
	const defaultTitle = 'Sett Vaults';
	const defaultSubtitle = 'Powerful Bitcoin strategies. Automatic staking rewards.';
	const defaultPeriod = 'YEAR';
	const defaultCurrency = 'USD';
	const connectedStore = store;
	connectedStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';

	test('Renders and displays default info', () => {
		const { getByText } = render(
			<StoreProvider value={connectedStore}>
				<Landing />
			</StoreProvider>,
		);
		expect(getByText(defaultTitle)).toBeVisible;
		expect(getByText(defaultSubtitle)).toBeVisible;
		expect(getByText(defaultPeriod)).toBeVisible;
		expect(getByText(defaultCurrency)).toBeVisible;
	});

	test('Clicking portfolio switch shows empty portfolio', async () => {
		const { getByText, findByText } = render(
			<StoreProvider value={connectedStore}>
				<Landing />
			</StoreProvider>,
		);
		// Opens currency menu
		await fireEvent.click(getByText('Portfolio View'));

		// Checks that CAD is in menu
		const currency = await findByText('Your address does not have tokens to deposit.');
		expect(currency).toBeVisible;
	});
	// TODO: Create a mock Web3 provider
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
