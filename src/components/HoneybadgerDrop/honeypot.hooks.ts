import { StoreContext } from 'mobx/store-context';
import { useContext } from 'react';

export function usePoolDigg() {
	const store = useContext(StoreContext);
	const { poolBalance } = store.honeyPot;
	const { stats, rebaseStats } = store.uiState;

	if (!stats.stats.digg || !rebaseStats.btcPrice || !poolBalance) return;

	const rebasePercentage = ((stats.stats.digg - rebaseStats.btcPrice) / rebaseStats.btcPrice) * 0.1;
	return poolBalance.plus(poolBalance.multipliedBy(rebasePercentage));
}
