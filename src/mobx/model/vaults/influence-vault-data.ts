import { VaultDTO } from '@badger-dao/sdk';
import { InfluenceVaultEmissionRound } from '../charts/influence-vaults-graph';
import { VaultChartData } from './vault-charts';

export interface InfluenceVaultData {
	vault: VaultDTO | undefined;
	vaultChartData: VaultChartData[] | null;
	emissionsSchedules: InfluenceVaultEmissionRound[] | null;
	processingChartData: boolean;
	processingEmissions: boolean;
	swapPercentage: string;
}

export interface InfluenceVaultConfig {
	influenceVaultToken: string;
	poolToken: string;
	vaultToken: string;
	roundStart: number;
	sources: string[];
	rewardFrequencies: InfluenceVaultFrequency[];
	rewardFrequenciesModalInfo: InfluenceVaultModalInfo;
	withdrawModalInfo: InfluenceVaultModalInfo;
	perfomanceInfo: InfluenceVaultPerfomanceInfo;
	feeInfo: InfluenceVaultFeeInfo;
}

export interface InfluenceVaultFrequency {
	name: string;
	value: string;
}

export interface InfluenceVaultModalInfo {
	title: string;
	body: string[];
	points: string[][];
}

export interface InfluenceVaultPerfomanceInfo {
	body1: string[];
	body2: string[];
	liquity: string[];
}

export interface InfluenceVaultFeeInfo {
	fees: string[][];
	feeModalInfo: InfluenceVaultFeeModalInfo;
}

export interface InfluenceVaultFeeModalInfo {
	title: string;
	body: string[];
	points: InfluenceVaultPoint[];
}

export interface InfluenceVaultPoint {
	title: string[];
	body: string[];
}
