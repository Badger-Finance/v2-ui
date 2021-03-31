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
	const { stats, rebaseStats } = store.uiState;

	return (bdigg: BigNumber) => {
		if (!stats.stats.digg || !rebaseStats.btcPrice) return new BigNumber('0');
		const rebasePercentage = ((stats.stats.digg - rebaseStats.btcPrice) / rebaseStats.btcPrice) * 0.1;
		return bdigg.plus(bdigg.multipliedBy(rebasePercentage));
	};
}
