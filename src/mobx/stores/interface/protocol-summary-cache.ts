import { ProtocolSummary } from 'mobx/model';

export interface ProtocolSummaryCache {
	[chain: string]: ProtocolSummary | undefined | null;
}
