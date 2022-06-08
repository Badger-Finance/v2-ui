import { AccountLimits } from './account-limits';
import { SettBalance } from '../setts/sett-balance';

export interface Account {
	id: string;
	boost: number;
	boostRank: number;
	stakeRatio: number;
	nativeBalance: number;
	nonNativeBalance: number;
	depositLimits: AccountLimits;
	// currently unused below
	value: number;
	earnedValue: number;
	balances: SettBalance[];
}
