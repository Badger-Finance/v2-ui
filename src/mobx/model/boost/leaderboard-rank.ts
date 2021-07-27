export interface LeaderboardRank {
	name: string;
	boostRangeStart: number;
	boostRangeEnd: number;
	signatureColor: string;
}

export interface BoostRank {
	name: string;
	signatureColor: string;
	levels: BoostRankLevel[];
}

export interface BoostRankLevel {
	stakeRatioBoundary: number;
	multiplier: number;
}
