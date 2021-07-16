import { FeeConfig } from '../fees/fee-config';

export interface StrategyConfig {
	name: string;
	address: string;
	fees: FeeConfig;
	strategyLink: string;
}
