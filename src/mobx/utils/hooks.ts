import React from 'react';
import { StoreContext } from 'mobx/store-context';

/**
 * Utility hook that return the a function that upon execution will prompt wallet connection
 * @returns wallet connection prompt function
 */
export function useConnectWallet(): () => void {
	const store = React.useContext(StoreContext);
	const { onboard } = store.wallet;

	return async () => {
		if (store.uiState.sidebarOpen) store.uiState.closeSidebar();

		const walletSelected = await onboard.walletSelect();
		const walletReady = await onboard.walletCheck();

		if (walletSelected && walletReady) {
			store.wallet.connect(onboard);
		}
	};
}
