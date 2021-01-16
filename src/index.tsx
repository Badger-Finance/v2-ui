import React from 'react';
import ReactDOM from 'react-dom';
import { MobxRouter, startRouter } from 'mobx-router';

import { StoreProvider } from './context/store-context';

//material
import { Container, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { Snackbar } from './components/Snackbar';

//mobx
import store from './mobx/store';

//router
import routes from './config/routes';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

//css
import './assets/css/onboard-override.css';
import './assets/css/body.css';
import { darkTheme } from './config/themes/dark';

startRouter(routes, store, {
	html5history: true, // or false if you want to use hash based routing
});

ReactDOM.render(
	<StoreProvider value={store}>
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Snackbar>
				<Header />

				<Container maxWidth={false}>
					<MobxRouter store={store} />
				</Container>
				<Sidebar />
			</Snackbar>
		</ThemeProvider>
	</StoreProvider>,
	document.getElementById('root'),
);