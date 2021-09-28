import { Sett } from 'mobx/model/setts/sett';
import { SettStrategy } from 'mobx/model/setts/sett-strategy';
import { StrategyConfig } from '../model/strategies/strategy-config';
import { StrategyFee } from '../model/system-config/stategy-fees';

export const getNonEmptyStrategyFees = (config: StrategyConfig): StrategyFee[] => {
	const fees = config.fees;
	const feeKeys = Object.keys(fees) as StrategyFee[];
	return feeKeys.filter((key) => fees[key]?.gt(0));
};

export function getStrategyFee(sett: Sett, fee: StrategyFee, config: StrategyConfig): number {
	const defaultFee = config.fees;
	const { strategy } = sett;
	let requestedFee: number | undefined = 0;
	if (strategy) {
		requestedFee = getSettStrategyFee(strategy, fee);
	}
	if (!requestedFee && defaultFee) {
		switch (fee) {
			case StrategyFee.withdraw:
				requestedFee = defaultFee.withdraw?.toNumber();
				break;
			case StrategyFee.performance:
				requestedFee = defaultFee.performance?.toNumber();
				break;
			case StrategyFee.strategistPerformance:
				requestedFee = defaultFee.strategistPerformance?.toNumber();
				break;
			case StrategyFee.daoPerformance:
				requestedFee = defaultFee.daoPerformance?.toNumber();
				break;
			default:
				// default fee to 0 to quickly see incorrect / missing fee configurations
				requestedFee = 0;
				break;
		}
	}
	// default fee to 0 to quickly see incorrect / missing fee configurations
	return requestedFee ?? 0;
}

function getSettStrategyFee(strategy: SettStrategy, fee: StrategyFee): number | undefined {
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
