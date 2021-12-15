import React from 'react';
import ReactDOM from 'react-dom';
import { startRouter } from 'mobx-router';
import { StoreProvider } from './mobx/store-context';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { Snackbar } from './components/Snackbar';
import store from './mobx/RootStore';
import routes from './config/routes';
import { App } from './components/App';
import './assets/css/onboard-override.css';
import './assets/css/body.css';
import { darkTheme } from './config/ui/dark';

startRouter(routes, store, {
	html5history: true,
	// reason: package does not recognize the prop but is described in the type definition and in the docs
	// https://github.com/kitze/mobx-router#custom-director-configuration
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	notfound: () => store.router.goTo(routes.notFound),
});

ReactDOM.render(
	<StoreProvider value={store}>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Snackbar>
				<App />
			</Snackbar>
		</ThemeProvider>
	</StoreProvider>,
	document.getElementById('root'),
);
