import { StrategyConfig } from '../model/strategies/strategy-config';

export const getFeesFromStrategy = (strategy: StrategyConfig): string[] => {
	const feeList: string[] = [];
	if (!strategy) return [];
	// fees are stored in BIPs on the contract, dividing by 10**2 makes them readable %
	Object.keys(strategy.fees).forEach((key) => {
		const value = strategy.fees[key];
		if (value.gt(0)) {
			feeList.push(`${key}:  ${value.dividedBy(10 ** 2).toString()}%`);
		}
	});
	return feeList;
};
