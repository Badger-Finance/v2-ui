import BigNumber from 'bignumber.js';

export interface FeeConfig {
	[feeName: string]: BigNumber;
}
