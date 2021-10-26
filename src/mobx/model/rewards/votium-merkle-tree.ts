export interface VotiumMerkleTree {
	merkleRoot: string;
	tokenTotal: string;
	claims: Record<string, VotiumMerkleTreeClaim>;
}

export interface VotiumMerkleTreeClaim {
	index: number;
	amount: string;
	proof: string[];
}

export interface VotiumTreeEntry {
	path: string;
}

export interface VotiumGithubTreeInformation {
	tree: VotiumTreeEntry[];
}
