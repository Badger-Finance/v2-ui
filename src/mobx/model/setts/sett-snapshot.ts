import { Network } from '@badger-dao/sdk';

export interface SettChartFetchParams {
	id: string;
	chain?: Network;
	from?: Date;
	to?: Date;
	granularity?: SettSnapshotGranularity;
}

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
