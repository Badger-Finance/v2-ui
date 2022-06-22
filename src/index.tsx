import './assets/css/body.css';

import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { StoreProvider } from 'mobx/stores/store-context';
import { startRouter } from 'mobx-router';
import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer } from 'react-toastify';

import { App } from './components/App';
import NetworkURLManager from './components-v2/NetworkURLManager';
import routes from './config/routes';
import { darkTheme } from './config/ui/dark';
import store from './mobx/stores/RootStore';

import 'react-toastify/dist/ReactToastify.css';

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
      <NetworkURLManager />
      <App />
      <ToastContainer
        position="bottom-right"
        newestOnTop={true}
        closeOnClick
        theme="dark"
        draggable
      />
    </ThemeProvider>
  </StoreProvider>,
  document.getElementById('root'),
);
