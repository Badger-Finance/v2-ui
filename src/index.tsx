import './assets/css/body.css';
import 'react-toastify/dist/ReactToastify.css';

import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import { Web3Modal } from '@web3modal/react';
import { StoreProvider } from 'mobx/stores/store-context';
import { projectId } from 'mobx/stores/WalletStore';
import { startRouter } from 'mobx-router';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import { WagmiConfig } from 'wagmi';

import { App } from './components/App';
import NetworkURLManager from './components-v2/NetworkURLManager';
import routes from './config/routes';
import { darkTheme } from './config/ui/dark';
import store from './mobx/stores/RootStore';

startRouter(routes, store, {
  html5history: true,
  // reason: package does not recognize the prop but is described in the type definition and in the docs
  // https://github.com/kitze/mobx-router#custom-director-configuration
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  notfound: () => store.router.goTo(routes.notFound),
});

const container = document.getElementById('root');
// required per react docs
/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
const root = createRoot(container!);
root.render(
  <StoreProvider value={store}>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NetworkURLManager />
      <WagmiConfig client={store.wallet.wagmiClient}>
        <App />
      </WagmiConfig>
      <Web3Modal
        themeColor="orange"
        themeZIndex={9999}
        projectId={projectId}
        ethereumClient={store.wallet.ethereumClient}
      />
      <ToastContainer position="bottom-right" newestOnTop={true} closeOnClick theme="dark" draggable />
    </ThemeProvider>
  </StoreProvider>,
);
