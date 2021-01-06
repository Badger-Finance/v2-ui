import React from 'react';
import ReactDOM from 'react-dom';
import { MobxRouter, startRouter } from 'mobx-router';

import { StoreProvider } from "./context/store-context";

//material
import { Container, CssBaseline, Grid, List, ListItem, ListItemText, Typography } from "@material-ui/core"
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Snackbar } from './components/Snackbar';
import { ErrorBoundary } from 'react-error-boundary'

//mobx
import store from './mobx/store';

//router
import routes from './config/routes';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

//css
import './assets/css/onboard-override.css'
import './assets/css/body.css'
import { darkTheme } from './config/themes/dark';
import { lightTheme } from './config/themes/light';
import { FallbackProps } from "react-error-boundary";
import { withErrorBoundary } from "react-error-boundary";

startRouter(routes, store, {
	html5history: true, // or false if you want to use hash based routing
});

const ErrorMessage: React.FC<FallbackProps> = ({ error }) => {
	return (
		<article>
			<h1>An error has occurred.</h1>
			<p>{error?.message}</p>
		</article>
	);
};


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
	</StoreProvider>, document.getElementById('root')
)



