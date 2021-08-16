import { ProtocolSummary } from './protocol-summary';

export interface ProtocolSummaryCache {
	[chain: string]: ProtocolSummary | undefined | null;
}
