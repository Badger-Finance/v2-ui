import { FeeConfig } from '../fees/fee-config';

export interface StrategyConfig {
	name: string;
	address: string;
	fees: FeeConfig;
	strategyLink: string;
	// TODO: make descriptions and deposit instructions required after marketing team provides the content
	description?: string;
	depositInstructions?: string;
}
