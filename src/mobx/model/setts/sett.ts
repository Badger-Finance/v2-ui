import { SettSummary } from './sett-summary';
import { SettState } from './sett-state';
import { SettTokenBalance } from './sett-token-balance';
import { SettValueSource } from './sett-value-source';
import { BouncerType } from './bouncer-type';
import { SettStrategy } from './sett-strategy';

export interface Sett extends SettSummary {
	name: string;
	value: number;
	balance: number;
	asset: string;
	vaultAsset: string;
	boostable: boolean;
	deprecated: boolean;
	experimental: boolean;
	bouncer: BouncerType;
	apr: number;
	minApr?: number;
	maxApr?: number;
	pricePerFullShare: number;
	sources: SettValueSource[];
	state: SettState;
	tokens: SettTokenBalance[];
	underlyingToken: string;
	vaultToken: string;
	strategy: SettStrategy;
}
