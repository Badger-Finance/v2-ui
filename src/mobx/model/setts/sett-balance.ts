import { SettTokenBalance } from './sett-token-balance';

export interface SettBalance {
	id: string;
	name: string;
	asset: string;
	ppfs: number;
	balance: number;
	value: number;
	earnedTokens: SettTokenBalance[];
	tokens: SettTokenBalance[];
	earnedBalance: number;
	earnedValue: number;
	depositedBalance: number;
	withdrawnBalance: number;
}
