//css
import './assets/css/onboard-override.css';
import './assets/css/body.css';

//material
import { Container, CssBaseline } from '@material-ui/core';
import { MobxRouter, startRouter } from 'mobx-router';

import { Header } from './components/Header';
import React from 'react';
import ReactDOM from 'react-dom';
import { Sidebar } from './components/Sidebar';
import { Snackbar } from './components/Snackbar';
import { StoreProvider } from './mobx/store-context';
import { ThemeProvider } from '@material-ui/core/styles';
import { darkTheme } from './config/ui/dark';
//router
import routes from './config/routes';
//mobx
import store from './mobx/store';

startRouter(routes, store, {
	html5history: true, // or false if you want to use hash based routing
});

// const ErrorMessage: React.FC<FallbackProps> = ({ error }) => {
// 	return (
// 		<article>
// 			<h1>An error has occurred.</h1>
// 			<p>{error?.message}</p>
// 		</article>
// 	);
// };

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
