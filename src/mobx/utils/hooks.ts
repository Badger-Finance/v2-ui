import React from 'react';
import { StoreContext } from 'mobx/store-context';
import BigNumber from 'bignumber.js';

export function useConnectWallet(): () => Promise<void> {
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

export function useBdiggToDigg(): (bDigg: BigNumber) => BigNumber {
	const store = React.useContext(StoreContext);
	const digg = store.uiState.stats.stats.digg;
	const btcPrice = store.uiState.rebaseStats.btcPrice;

	return (bdigg: BigNumber) => {
		if (!digg || !btcPrice) return new BigNumber('NaN');
		const rebasePercentage = ((digg - btcPrice) / btcPrice) * 0.1;
		return bdigg.plus(bdigg.multipliedBy(rebasePercentage));
	};
}
