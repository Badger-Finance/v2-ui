import { Performance } from '../rewards/performance';

export type SettValueSource = {
	name: string;
	apr: number;
	performance: Performance;
	boostable: boolean;
	harvestable: boolean;
	minApr: number;
	maxApr: number;
};
