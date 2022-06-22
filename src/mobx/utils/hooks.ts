import { StoreContext } from 'mobx/stores/store-context';
import React from 'react';

/**
 * Utility hook that return the a function that upon execution will prompt wallet connection
 * @returns wallet connection prompt function
 */
export function useConnectWallet(): () => void {
  const store = React.useContext(StoreContext);
  const { wallet } = store;

  return async () => {
    if (store.uiState.sidebarOpen) {
      store.uiState.closeSidebar();
    }
    await wallet.connect();
  };
}
