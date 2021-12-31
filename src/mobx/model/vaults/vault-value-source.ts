import { Performance } from '../rewards/performance';

export type VaultValueSource = {
	name: string;
	apy: number;
	apr: number;
	performance: Performance;
	boostable: boolean;
	harvestable: boolean;
	minApr: number;
	maxApr: number;
};
