import { DepositLimit } from './deposit-limit';

export interface AccountLimits {
	[contract: string]: DepositLimit;
}
