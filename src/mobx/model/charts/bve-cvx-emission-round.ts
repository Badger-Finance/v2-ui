export interface InfluenceVaultEmissionRound {
	tokens: EmissionRoundToken[];
	graph: Graph;
	vaultTokens: number;
	vaultValue: number;

	start: number;
	index: number;
	diviserTokenSymbol: string;
}

export interface Graph {
	value1: number;
	value2: number;
	value3: number;
}

export interface EmissionRoundToken {
	symbol: string;
	balance: number;
	value: number;
}
