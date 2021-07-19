import { SettTokenBalance } from './sett-token-balance';

export interface SettBalance {
	id: string;
	name: string;
	asset: string;
	balance: SettTokenBalance[];
	value: number;
	earnedTokens: SettTokenBalance[];
	earnedValue: number;
}
