import { StrategyConfig } from '../model/strategies/strategy-config';
import { StrategyFee } from '../model/system-config/stategy-fees';

export const getNonEmptyStrategyFees = (config: StrategyConfig): StrategyFee[] => {
	const fees = config.fees;
	const feeKeys = Object.keys(fees) as StrategyFee[];
	return feeKeys.filter((key) => fees[key]?.gt(0));
};
