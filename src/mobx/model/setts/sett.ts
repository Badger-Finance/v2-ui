import { SettSummary } from './sett-summary';
import { SettState } from './sett-state';
import { SettTokenBalance } from './sett-token-balance';
import { SettValueSource } from './sett-value-source';

export interface Sett extends SettSummary {
	apr: number;
	asset: string;
	boostable: boolean;
	experimental: boolean;
	hasBouncer: boolean;
	maxApr?: number;
	minApr?: number;
	ppfs: number;
	sources: SettValueSource[];
	state: SettState;
	tokens: SettTokenBalance[];
	underlyingToken: string;
	vaultToken: string;
}
