import { MethodResult } from './method-result';

export interface CallResult {
	address?: string;
	contract?: string;
	namespace: string;

	// defined expected call values
	available?: MethodResult[];
	balanceOf?: MethodResult[];
	totalStakedFor?: MethodResult[];
	guestList?: MethodResult[];
	remainingTotalDepositAllowed?: MethodResult[];
	remainingUserDepositAllowed?: MethodResult[];
	totalDepositCap?: MethodResult[];
	userDepositCap?: MethodResult[];
}
