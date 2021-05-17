import React from 'react';
import { customRender, fireEvent, cleanup, screen, act } from './Utils';
import Landing from '../pages/Landing';
import '@testing-library/jest-dom';
import { StoreProvider } from '../mobx/store-context';
import store from '../mobx/store';
import { TokenModel } from 'mobx/model';
import addresses from 'config/ibBTC/addresses.json';
import BigNumber from 'bignumber.js';

const tokensConfig = addresses.mainnet.contracts.tokens;
const mockIbBTC = new TokenModel(store, tokensConfig['ibBTC']);

describe('Landing Page', () => {
	const connectedStore = store;
	connectedStore.ibBTCStore.ibBTC = mockIbBTC;

	connectedStore.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';

	beforeEach(() => {
		connectedStore.ibBTCStore.getMintLimit = jest.fn().mockReturnValue({
			userLimit: new BigNumber('5000000000'),
			allUsersLimit: new BigNumber('10000000000'),
			individualLimit: new BigNumber('5000000000'),
			globalLimit: new BigNumber('10000000000'),
		});
		jest.spyOn(connectedStore.ibBTCStore, 'fetchBalance').mockImplementation(async () => {
			return new BigNumber('100');
		});
		jest.spyOn(connectedStore.honeyPot, 'fetchNFTS').mockImplementation(async () => {
			new Promise(() => {
				return;
			});
		});
		jest.spyOn(connectedStore.ibBTCStore, 'init').mockImplementation(() => {
			return;
		});
	});

	afterEach(cleanup);

	test('Renders correctly', () => {
		const { container } = customRender(
			<StoreProvider value={connectedStore}>
				<Landing experimental={false} />
			</StoreProvider>,
		);
		expect(container).toMatchSnapshot();
	});

	test('Clicking portfolio switch shows empty portfolio', async () => {
		const { container } = customRender(
			<StoreProvider value={connectedStore}>
				<Landing experimental={false} />
			</StoreProvider>,
		);
		// Clicks on switch
		await act(async () => {
			await fireEvent.click(screen.getByText('Portfolio View'));
		});
		expect(container).toMatchSnapshot();
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
