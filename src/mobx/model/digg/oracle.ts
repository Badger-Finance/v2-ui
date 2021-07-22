import { ProviderReport } from './provider-reports';

export interface OracleReports {
	address: string;
	namespace: string;
	providerReports: ProviderReport[];
}
