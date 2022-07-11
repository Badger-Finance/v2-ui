import { VaultDTO } from '@badger-dao/sdk';
import { InfluenceVaultEmissionRound } from '../charts/bve-cvx-emission-round';
import { VaultChartData } from './vault-charts';

export interface InfluenceVaultData {
	vault: VaultDTO | undefined;
	vaultChartData: VaultChartData[] | null;
	emissionsSchedules: InfluenceVaultEmissionRound[] | null;
	processingChartData: boolean;
	processingEmissions: boolean;
	swapPercentage: string;
}
