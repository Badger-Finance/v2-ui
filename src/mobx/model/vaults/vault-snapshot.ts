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
