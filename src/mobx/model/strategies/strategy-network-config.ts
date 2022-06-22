import { StrategyConfig } from './strategy-config';

export interface StrategyNetworkConfig {
  [vaultAddress: string]: StrategyConfig;
}
