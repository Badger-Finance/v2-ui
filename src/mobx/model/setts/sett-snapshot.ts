import { ChainNetwork } from 'config/enums/chain-network.enum';

export interface SettChartFetchParams {
	id: string;
	chain?: ChainNetwork;
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
