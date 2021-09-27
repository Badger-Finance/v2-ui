import { SettSummary } from './sett-summary';
import { SettState } from './sett-state';
import { SettTokenBalance } from './sett-token-balance';
import { SettValueSource } from './sett-value-source';
import { SettBoost } from './sett-boost';
import { BouncerType } from './sett-bouncer';
import { SettStrategy } from './sett-strategy';

export interface Sett extends SettSummary {
	apr: number;
	asset: string;
	vaultAsset: string;
	boostable: boolean;
	experimental: boolean;
	bouncer: BouncerType;
	maxApr?: number;
	minApr?: number;
	ppfs: number;
	sources: SettValueSource[];
	state: SettState;
	tokens: SettTokenBalance[];
	underlyingToken: string;
	vaultToken: string;
	deprecated?: boolean;
	slug: string;
	multipliers: SettBoost[];
	strategy: SettStrategy;
}
