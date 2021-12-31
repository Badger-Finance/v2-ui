import { Network } from '@badger-dao/sdk';

export interface VaultChartFetchParams {
	id: string;
	chain?: Network;
	from?: Date;
	to?: Date;
	granularity?: VaultSnapshotGranularity;
}

export enum VaultSnapshotGranularity {
	HOUR = 'hour',
	DAY = 'day',
}

export interface VaultSnapshot {
	address: string;
	height: number;
	timestamp: number;
	balance: number;
	supply: number;
	ratio: number;
	value: number;
}
