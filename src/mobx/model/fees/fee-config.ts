import BigNumber from 'bignumber.js';
import { StrategyFee } from '../system-config/stategy-fees';

export type FeeConfig = {
	[Property in StrategyFee]?: BigNumber;
};
