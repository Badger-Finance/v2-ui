import { SettStrategy } from 'mobx/model/setts/sett-strategy';
import { StrategyConfig } from '../model/strategies/strategy-config';
import { StrategyFee } from '../model/system-config/stategy-fees';

export const getNonEmptyStrategyFees = (config: StrategyConfig): StrategyFee[] => {
	const fees = config.fees;
	const feeKeys = Object.keys(fees) as StrategyFee[];
	return feeKeys.filter((key) => fees[key]?.gt(0));
};

export function getStrategyFee(strategy: SettStrategy, fee: StrategyFee): number | undefined {
	if (!strategy) {
		return;
	}
	switch (fee) {
		case StrategyFee.withdraw:
			return strategy.withdrawFee;
		case StrategyFee.performance:
			return strategy.performanceFee;
		case StrategyFee.strategistPerformance:
			return strategy.strategistFee;
		case StrategyFee.daoPerformance:
			return strategy.performanceFee + strategy.strategistFee;
		default:
			return;
	}
}
