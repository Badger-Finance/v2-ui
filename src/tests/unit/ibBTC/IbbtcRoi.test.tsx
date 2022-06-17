import '@testing-library/jest-dom';

import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { StoreProvider } from 'mobx/stores/store-context';
import React from 'react';

import { IbbtcRoi } from '../../../components/IbBTC/IbbtcRoi';
import { darkTheme } from '../../../config/ui/dark';
import IbBTCStore from '../../../mobx/stores/ibBTCStore';
import store from '../../../mobx/stores/RootStore';
import { customRender, screen } from '../../Utils';
import { SAMPLE_IBBTC_TOKEN_BALANCE } from '../../utils/samples';

it('displays N/A state', () => {
	jest.spyOn(IbBTCStore.prototype, 'ibBTC', 'get').mockReturnValue(SAMPLE_IBBTC_TOKEN_BALANCE);
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
	jest.spyOn(IbBTCStore.prototype, 'ibBTC', 'get').mockReturnValue(SAMPLE_IBBTC_TOKEN_BALANCE);
	customRender(
		<StoreProvider value={store}>
			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<IbbtcRoi />
			</ThemeProvider>
		</StoreProvider>,
	);
	expect(screen.getByText(`${store.ibBTCStore.ibBTC.token.symbol} ROI`)).toBeInTheDocument();
	expect(screen.getByAltText('ROI Token Logo')).toBeInTheDocument();
});

it('displays APY information', () => {
	jest.spyOn(IbBTCStore.prototype, 'ibBTC', 'get').mockReturnValue(SAMPLE_IBBTC_TOKEN_BALANCE);
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
