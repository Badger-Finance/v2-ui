export enum SettSnapshotGranularity {
	HOUR = 'hour',
	DAY = 'day',
}

export interface SettSnapshot {
	address: string;
	height: number;
	timestamp: number;
	balance: number;
	supply: number;
	ratio: number;
	value: number;
}
