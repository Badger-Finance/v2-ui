import { SettSummary } from '../setts/sett-summary';

export type ProtocolSummary = {
	totalValue: number;
	setts?: SettSummary[];
};
