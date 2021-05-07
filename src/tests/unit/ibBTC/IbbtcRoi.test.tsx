import React from 'react';
import '@testing-library/jest-dom';

import { TokenModel } from '../../../mobx/model';
import addresses from 'config/ibBTC/addresses.json';
import { customRender, screen } from '../../Utils';
import { IbbtcRoi } from '../../../components/IbBTC/IbbtcRoi';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { darkTheme } from '../../../config/ui/dark';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

it('displays N/A state', () => {
	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcRoi />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getAllByText('N/A')).toHaveLength(2);
});

it('displays logo and name', () => {
	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcRoi />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getByText(`${store.ibBTCStore.ibBTC.symbol} ROI`)).toBeInTheDocument();
	expect(screen.getByAltText('ROI Token Logo')).toBeInTheDocument();
});

it('displays APY information', () => {
	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
	store.ibBTCStore.apyUsingLastDay = '25.032%';
	store.ibBTCStore.apyUsingLastWeek = '18.234%';

	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcRoi />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getByText('25.032%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last 24 hrs')).toBeInTheDocument();
	expect(screen.getByText('18.234%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last week')).toBeInTheDocument();
});

// This test requires of a Mock Web3 Provider which is being implemented in a separate branch

// it('displays loading state', () => {
// 	store.wallet.connectedAddress = '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a';
// 	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
// 	customRender(
// 		<StoreProvider value={store}>
// 			<ThemeProvider theme={darkTheme}>
// 				<CssBaseline />
// 				<IbbtcRoi />
// 			</ThemeProvider>
// 		</StoreProvider>,
// 	);
// 	expect(screen.getAllByRole('loader')).toHaveLength(2);
// });
