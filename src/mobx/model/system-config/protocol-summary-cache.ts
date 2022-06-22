import { ProtocolSummary } from '@badger-dao/sdk';

export interface ProtocolSummaryCache {
  [chain: string]: ProtocolSummary | undefined | null;
}
