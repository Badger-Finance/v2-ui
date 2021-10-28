import { Sett } from '@badger-dao/sdk';
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
	let requestedFee: number | undefined;
	if (strategy) {
		requestedFee = getSettStrategyFee(strategy, fee);
	}
	if (requestedFee === undefined) {
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
			case StrategyFee.yearnManagement:
				requestedFee = defaultFee.yearnManagement?.toNumber();
				break;
			case StrategyFee.yearnPerformance:
				requestedFee = defaultFee.yearnPerformance?.toNumber();
				break;
			case StrategyFee.harvestPerformance:
				requestedFee = defaultFee.harvestPerformance?.toNumber();
				break;
			case StrategyFee.harvestStrategistPerformance:
				requestedFee = defaultFee.harvestStrategistPerformance?.toNumber();
				break;
			default:
				break;
		}
	}
	if (requestedFee === undefined) {
		throw new Error(`${sett.name} missing default ${fee} fee`);
	}
	return requestedFee;
}

function getSettStrategyFee(strategy: SettStrategy, fee: StrategyFee): number | undefined {
	switch (fee) {
		case StrategyFee.withdraw:
			return strategy.withdrawFee;
		case StrategyFee.performance:
			return strategy.performanceFee;
		case StrategyFee.strategistPerformance:
			return strategy.strategistFee;
		default:
			return;
	}
}
