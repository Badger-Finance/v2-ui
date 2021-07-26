import BigNumber from 'bignumber.js';

export interface RebaseInfo {
	totalSupply: BigNumber;
	latestRebase: number;
	minRebaseInterval: number;
	latestAnswer: number;
	inRebaseWindow: boolean;
	rebaseLag: number;

	epoch: any;
	rebaseWindowLengthSec: number;
	oracleRate: BigNumber;
	nextRebase: Date;
	pastRebase: any;

	expirationTimestamp: Date;
	expiryPrice: BigNumber;
	dropt2CurrentTimestamp: Date;
}
