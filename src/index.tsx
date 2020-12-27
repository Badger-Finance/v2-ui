import React from 'react';
import ReactDOM from 'react-dom';
import { MobxRouter, startRouter } from 'mobx-router';

import { StoreProvider } from "./context/store-context";

//material
import { Container, CssBaseline, Grid, List, ListItem, ListItemText } from "@material-ui/core"
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { SnackbarProvider, useSnackbar } from 'notistack';

//mobx
import store from './mobx/store';

//router
import routes from './config/routes';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

//css
import './assets/css/onboard-override.css'

const theme = createMuiTheme({
	palette: {
		type: 'dark',
		primary: { main: "#F2A52B" },
	},
	typography: {
		fontFamily: "'IBM Plex Sans'"
	},
	shape: {
		borderRadius: 8
	},
	overrides: {
		MuiTooltip: {
			tooltip: {
				fontSize: "1rem",
			}
		}
	}
});

startRouter(routes, store, {
	html5history: true, // or false if you want to use hash based routing
});

ReactDOM.render(
	<StoreProvider value={store}>
		<ThemeProvider theme={theme}>

			<CssBaseline />
			<SnackbarProvider maxSnack={5} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
				<Header />

				<Container maxWidth={false}>
					<Grid container spacing={4}>
						<Grid item xs={12} md={12} style={{}}>
							<MobxRouter store={store} />
						</Grid>
					</Grid>
				</Container>
				<Sidebar />

			</SnackbarProvider>

		</ThemeProvider>
	</StoreProvider>, document.getElementById('root')
)