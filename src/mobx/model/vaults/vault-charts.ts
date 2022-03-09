export interface VaultChartData {
	address: string;
	height: number;
	timestamp: Date;
	balance: number;
	supply: number;
	ratio: number;
	pricePerFullShare: number;
	value: number;
}

export enum ChartMode {
	Value = 'value',
	Ratio = 'ratio',
	AccountBalance = 'accountBalance',
	BoostMultiplier = 'boostMultiplier',
}

export enum VaultChartTimeframe {
	Day = 'day',
	Week = 'week',
	Month = 'month',
}
