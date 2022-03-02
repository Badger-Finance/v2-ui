import React from 'react';
import { darkTheme } from '../src/config/ui/dark';
import { ThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
};

export const decorators = [
	(Story) => (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Story />
		</ThemeProvider>
	),
];
