import React from 'react';
import ReactDOM from 'react-dom';
import { startRouter } from 'mobx-router';
import { StoreProvider } from './mobx/store-context';

//material
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { Snackbar } from './components/Snackbar';

//mobx
import store from './mobx/store';

//router
import routes from './config/routes';
import { App } from './components/App';

//css
import './assets/css/onboard-override.css';
import './assets/css/body.css';
import { darkTheme } from './config/ui/dark';

startRouter(routes, store, {
	html5history: true, // or false if you want to use hash based routing
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
