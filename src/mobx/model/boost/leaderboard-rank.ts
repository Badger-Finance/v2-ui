export interface BoostRank {
	name: string;
	signatureColor: string;
	levels: BoostRankLevel[];
}

export interface BoostRankLevel {
	stakeRatioBoundary: number;
	multiplier: number;
}
