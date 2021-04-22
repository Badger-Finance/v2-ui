import React from 'react';
import BigNumber from 'bignumber.js';
import '@testing-library/jest-dom';
import { action } from 'mobx';

import { customRender, screen } from '../Utils';
import addresses from 'config/ibBTC/addresses.json';
import store from '../../mobx/store';
import { StoreProvider } from '../../mobx/store-context';
import { TokenModel } from '../../mobx/model';
import { Mint } from '../../components/IbBTC/Mint';

// this is a workaround for the 'TypeError: document.createRange is not a function' error using the tooltip
// see https://github.com/mui-org/material-ui/issues/15726
(global as any).document.createRange = () => ({
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setStart: () => {},
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	setEnd: () => {},
	commonAncestorContainer: {
		nodeName: 'BODY',
		ownerDocument: document,
	},
});

const mockCalcMintAmount = action(
	jest.fn().mockImplementation(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async (inToken: TokenModel, amount: BigNumber, callback: (err: any, result: any) => void) => {
			callback(null, [new BigNumber('20').multipliedBy(10 ** 18), new BigNumber('0.010').multipliedBy(10 ** 18)]);
		},
	),
);

const mockIbtc = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
const mockTokens = [
	new TokenModel(store, addresses.mainnet.contracts.tokens['bcrvRenWSBTC']),
	new TokenModel(store, addresses.mainnet.contracts.tokens['bcrvRenWBTC']),
	new TokenModel(store, addresses.mainnet.contracts.tokens['btbtc/sbtcCrv']),
];

store.ibBTCStore.init = action(jest.fn());
store.ibBTCStore.calcMintAmount = mockCalcMintAmount;
store.ibBTCStore.ibBTC = mockIbtc;
store.ibBTCStore.tokens = mockTokens;

it('displays tokens list with correct default token', () => {
	const defaultToken = mockTokens[0];
	customRender(
		<StoreProvider value={store}>
			<Mint />
		</StoreProvider>,
	);
	// the select uses the token image and the token name
	expect(screen.getByRole('button', { name: `${defaultToken.name} ${defaultToken.symbol}` })).toBeInTheDocument();
});

it('displays tokens list', () => {
	const defaultToken = mockTokens[0];
	customRender(
		<StoreProvider value={store}>
			<Mint />
		</StoreProvider>,
	);

	expect(screen.getByRole('button', { name: `${defaultToken.name} ${defaultToken.symbol}` })).toBeInTheDocument();
});
