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

const theme = createMuiTheme({
	palette: {
		type: 'dark',
		primary: { main: "#F2A52B" },
	},
	typography: {
		// fontSize: 16,
		fontFamily: "'IBM Plex Sans'"
		// h1: { fontFamily: "'Press Start 2P'", fontSize: "2.5rem" },
		// h2: { fontFamily: "'Press Start 2P'", fontSize: "2rem" },
		// h3: { fontFamily: "'Press Start 2P'", fontSize: "1.8rem" },
		// h4: { fontFamily: "'Press Start 2P'", fontSize: "1rem" },
		// h5: { fontFamily: "'Press Start 2P'" },
		// h6: { fontFamily: "'Press Start 2P'" },
	},
	shape: {
		borderRadius: 8
	},
	overrides: {
		MuiCssBaseline: {
			'@global': {
			  '.bn-onboard-modal-content': {
				backgroundColor: '#424242 !important',
			  },
			  '.bn-onboard-icon-button:hover': {
				backgroundColor: '#303030 !important'
			  },
			  '.bn-onboard-dark-mode-background-hover:hover': {
				backgroundColor: '#303030 !important'
			  },
			  '.bn-onboard-custom.bn-onboard-dark-mode-link': {
				color: '#F2A52B !important',
				borderColor: '#F2A52B !important'
			  },
			  '.bn-onboard-selected-wallet': {
				backgroundColor: '#222 !important'
			  },
			  '.bn-onboard-dark-mode-close-background': {
				backgroundColor: '#303030 !important'
			  }
			},
		},
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
			<SnackbarProvider maxSnack={5} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
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