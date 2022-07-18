export interface InfluenceVaultEmissionRound {
	tokens: EmissionRoundToken[];
	graph: GraphObject;
	vaultTokens: number;
	vaultValue: number;

	start: number;
	index: number;
	diviserTokenSymbol: string;
}

export interface EmissionRoundToken {
	symbol: string;
	balance: number;
	value: number;
}

export interface GraphObject {
	[key: string]: number;
}
