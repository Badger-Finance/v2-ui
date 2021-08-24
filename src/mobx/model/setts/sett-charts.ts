export interface SettChartData {
	address: string;
	height: number;
	timestamp: Date;
	balance: number;
	supply: number;
	ratio: number;
	value: number;
}

export enum ChartMode {
	value = 'value',
	ratio = 'ratio',
	accountBalance = 'accountBalance',
}

export enum SettChartTimeframe {
	'day' = 'day',
	'week' = 'week',
	'month' = 'month',
}
