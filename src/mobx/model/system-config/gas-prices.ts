export interface GasPrices {
	[speed: string]: number | EIP1559GasPrices;
}

export interface EIP1559GasPrices {
	maxFeePerGas: number;
	maxPriorityFeePerGas: number;
}
