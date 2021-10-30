import { BigNumber } from 'ethers';
import { DroptInfo } from './dropt-info';

export interface RebaseInfo {
	totalSupply: BigNumber;
	latestRebase: number;
	minRebaseInterval: number;
	latestAnswer: number;
	inRebaseWindow: boolean;
	rebaseLag: number;
	sharesPerFragment: BigNumber;

	epoch: any;
	rebaseWindowLengthSec: number;
	oracleRate: BigNumber;
	nextRebase: Date;
	pastRebase: any;

	validDropts: DroptInfo[];
}
