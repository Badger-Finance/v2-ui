import { AccountLimits } from './account-limits';
import { SettBalance } from '../setts/sett-balance';
import { BoostMultipliers } from '../boost/boost-multipliers';

export interface Account {
	id: string;
	boost: number;
	boostRank: number;
	stakeRatio: number;
	nativeBalance: number;
	nonNativeBalance: number;
	multipliers: BoostMultipliers;
	depositLimits: AccountLimits;
	// currently unused below
	value: number;
	earnedValue: number;
	balances: SettBalance[];
}
