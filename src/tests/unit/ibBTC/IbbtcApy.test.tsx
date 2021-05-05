import React from 'react';
import '@testing-library/jest-dom';

import { TokenModel } from '../../../mobx/model';
import addresses from 'config/ibBTC/addresses.json';
import { customRender, screen } from '../../Utils';
import { IbbtcApy } from '../../../components/IbBTC/IbbtcApy';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { darkTheme } from '../../../config/ui/dark';
import { StoreProvider } from '../../../mobx/store-context';
import store from '../../../mobx/store';

it('displays loading state', () => {
	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcApy />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getAllByRole('loader')).toHaveLength(2);
});

it('displays logo and name', () => {
	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcApy />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getByText(`${store.ibBTCStore.ibBTC.symbol} APY`)).toBeInTheDocument();
	expect(screen.getByAltText('APY Token Logo')).toBeInTheDocument();
});

it('displays APY information', () => {
	store.ibBTCStore.ibBTC = new TokenModel(store, addresses.mainnet.contracts.tokens.ibBTC);
	store.ibBTCStore.apyUsingLastDay = '25.032%';
	store.ibBTCStore.apyUsingLastWeek = '18.234%';

	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcApy />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getByText('25.032%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last 24 hrs')).toBeInTheDocument();
	expect(screen.getByText('18.234%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last week')).toBeInTheDocument();
});
