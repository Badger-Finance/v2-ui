import BigNumber from 'bignumber.js';

export interface RebaseInfo {
	totalSupply: BigNumber;
	lastRebaseTimestampSec: number;
	minRebaseTimeIntervalSec: number;
	latestAnswerTimestamp: number;
	rebaseLag: any;
	epoch: any;
	inRebaseWindow: boolean;
	rebaseWindowLengthSec: number;
	oracleRate: BigNumber;
	nextRebase: Date;
	pastRebase: any;
}
