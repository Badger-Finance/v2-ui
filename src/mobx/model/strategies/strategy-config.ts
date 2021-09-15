import { FeeConfig } from '../fees/fee-config';

export interface StrategyConfig {
	address: string;
	fees: FeeConfig;
	strategyLink?: string;
	// TODO: make descriptions required after marketing team provides the content
	description?: string;
	userGuide?: string;
	depositLink?: string;
}
