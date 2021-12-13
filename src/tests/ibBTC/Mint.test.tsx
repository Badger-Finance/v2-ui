import React from 'react';
import '@testing-library/jest-dom';
import addresses from 'config/ibBTC/addresses.json';
import store from 'mobx/RootStore';
import { StoreProvider } from '../../mobx/store-context';
import { customRender, screen, fireEvent, cleanup, act } from '../Utils';
import { Mint } from '../../components/IbBTC/Mint';
import { IbbtcOptionToken } from '../../mobx/model/tokens/ibbtc-option-token';
import { Snackbar } from '../../components/Snackbar';
import Header from '../../components/Header';
import IbBTCStore from 'mobx/stores/ibBTCStore';
import { within } from '@testing-library/react';
import BigNumber from 'bignumber.js';

const tokensConfig = addresses.mainnet.tokens;
const mockIbBTC = new IbbtcOptionToken(store, tokensConfig['ibBTC']);
const mockTokens = [
	new IbbtcOptionToken(store, addresses.mainnet.tokens['bcrvRenBTC']),
	new IbbtcOptionToken(store, addresses.mainnet.tokens['bcrvRenSBTC']),
	new IbbtcOptionToken(store, addresses.mainnet.tokens['bcrvTBTC']),
];

describe('ibBTC Mint', () => {
	beforeEach(() => {
		store.onboard.address = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';

		store.ibBTCStore.ibBTC = mockIbBTC;
		store.ibBTCStore.tokens = mockTokens;
		store.ibBTCStore.tokens[0].balance = store.ibBTCStore.tokens[0].scale('5');
		store.ibBTCStore.tokens[1].balance = store.ibBTCStore.tokens[1].scale('10');
		store.ibBTCStore.ibBTC.balance = mockIbBTC.scale('10');
		store.ibBTCStore.mint = jest.fn();
		/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
		jest.spyOn(IbBTCStore.prototype, 'calcMintAmount').mockImplementation(async (_token, _amount) => ({
			bBTC: mockIbBTC.scale('11.988'),
			fee: mockIbBTC.scale('0.0120'),
		}));
	});

	afterEach(cleanup);

	it('displays token input balance and ibBTC balance', () => {
		customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);
		expect(screen.getByText('Balance: 5.000000')).toBeInTheDocument();
		expect(screen.getByText('Balance: 10.000000')).toBeInTheDocument();
	});

	it('can apply max balance', async () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);

		await act(async () => {
			fireEvent.click(await screen.findByRole('button', { name: /max/i }));
		});

		expect(container).toMatchSnapshot();
	});

	it('displays output ibBTC when mint amount is inputted', async () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);

		await act(async () => {
			fireEvent.change(await screen.findByRole('textbox'), { target: { value: '12' } });
		});

		await screen.findByRole('heading', { level: 1, name: '11.988000' });

		expect(container).toMatchSnapshot();
	});

	it('can change token', async () => {
		const { container } = customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'token options' }));

		const newTokenOption = within(screen.getByRole('list', { name: 'token options list' })).getByAltText(
			`${store.ibBTCStore.tokens[1].name} icon`,
		);

		fireEvent.click(newTokenOption);

		await screen.findByText(store.ibBTCStore.tokens[1].name);

		expect(container).toMatchSnapshot();
	});

	it('handles not connected wallet', () => {
		store.onboard.address = undefined;

		customRender(
			<StoreProvider value={store}>
				<Mint />
			</StoreProvider>,
		);

		expect(screen.getByRole('textbox')).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Connect Wallet' })).toBeEnabled();
	});

	it('handles empty balance', async () => {
		customRender(
			<StoreProvider value={store}>
				<Snackbar>
					<Header />
					<Mint />
				</Snackbar>
			</StoreProvider>,
		);

		fireEvent.change(screen.getByRole('textbox'), { target: { value: '12' } });

		await screen.findByText('11.988000 ibBTC');

		fireEvent.click(screen.getByRole('button', { name: /mint/i }));

		expect(screen.getByText('You have insufficient balance of bcrvRenBTC')).toBeInTheDocument();
	});

	it('executes calcMint with correct params', async () => {
		const calcMintSpy = jest.spyOn(IbBTCStore.prototype, 'calcMintAmount');

		customRender(
			<StoreProvider value={store}>
				<Snackbar>
					<Header />
					<Mint />
				</Snackbar>
			</StoreProvider>,
		);

		fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

		await screen.findByText('11.988000 ibBTC');

		expect(calcMintSpy).toHaveBeenNthCalledWith(
			1,
			store.ibBTCStore.tokens[0],
			store.ibBTCStore.tokens[0].scale('0.1'),
		);
	});

	it('executes mint with correct params', async () => {
		const mintSpy = jest.fn();
		store.ibBTCStore.mint = mintSpy;

		customRender(
			<StoreProvider value={store}>
				<Snackbar>
					<Header />
					<Mint />
				</Snackbar>
			</StoreProvider>,
		);

		fireEvent.change(screen.getByRole('textbox'), { target: { value: '0.1' } });

		await screen.findByText('11.988000 ibBTC');

		fireEvent.click(screen.getByRole('button', { name: /mint/i }));

		expect(mintSpy).toHaveBeenNthCalledWith(
			1,
			store.ibBTCStore.tokens[0],
			store.ibBTCStore.tokens[0].scale('0.1'),
			new BigNumber('1'),
		);
	});
});
