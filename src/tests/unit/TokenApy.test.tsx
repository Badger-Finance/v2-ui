import React from 'react';
import '@testing-library/jest-dom';
import { customRender, screen } from '../Utils';
import { TokenApy } from '../../components/IbBTC/TokenApy';
import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { darkTheme } from '../../config/ui/dark';

it('displays loading state', () => {
	customRender(
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<TokenApy name="Test" logo="logo" />
		</ThemeProvider>,
	);
	expect(screen.getAllByRole('loader')).toHaveLength(2);
});

it('displays logo and name', () => {
	customRender(
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<TokenApy name="Test" logo="logo" />
		</ThemeProvider>,
	);
	expect(screen.getByText('Test APY')).toBeInTheDocument();
	expect(screen.getByAltText('APY Token Logo')).toBeInTheDocument();
});

it('displays APY information', () => {
	customRender(
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<TokenApy name="name" logo="logo" apyFromLastDay="25.032%" apyFromLastWeek="18.234%" />
		</ThemeProvider>,
	);
	expect(screen.getByText('25.032%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last 24 hrs')).toBeInTheDocument();
	expect(screen.getByText('18.234%')).toBeInTheDocument();
	expect(screen.getByText('Sampled from last week')).toBeInTheDocument();
});
