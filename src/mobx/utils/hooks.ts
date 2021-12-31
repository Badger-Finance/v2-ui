import React from 'react';
import { StoreContext } from 'mobx/store-context';

/**
 * Utility hook that return the a function that upon execution will prompt wallet connection
 * @returns wallet connection prompt function
 */
export function useConnectWallet(): () => void {
  const store = React.useContext(StoreContext);
  const { onboard } = store;

  return async () => {
    if (store.uiState.sidebarOpen) {
      store.uiState.closeSidebar();
    }
    await onboard.connect();
  };
}
