import { BigNumber } from 'ethers';

export interface MintLimits {
	userLimit: BigNumber;
	allUsersLimit: BigNumber;
	individualLimit: BigNumber;
	globalLimit: BigNumber;
}
