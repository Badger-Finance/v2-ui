import { BatchResponse } from '../contract/batch-response';
import { ProviderReport } from './provider-reports';

export interface OracleReports extends BatchResponse {
	providerReports: ProviderReport[];
}
