import { VaultDTO, VaultSnapshot } from '@badger-dao/sdk';

import { InfluenceVaultEmissionRound } from '../charts/influence-vaults-graph';

export interface InfluenceVaultData {
  vault: VaultDTO | undefined;
  vaultChartData: VaultSnapshot[] | null;
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
  rewardFrequenciesModalConfig: InfluenceVaultModalConfig;
  withdrawModalConfig: InfluenceVaultModalConfig;
  perfomanceConfig: InfluenceVaultPerfomanceConfig;
  feeConfig: InfluenceVaultFeeConfig;
}

export interface InfluenceVaultFrequency {
  name: string;
  value: string;
}

export interface InfluenceVaultModalConfig {
  title: string;
  body: string[];
  points: string[][];
}

export interface InfluenceVaultPerfomanceConfig {
  body1: string[];
  body2: string[];
  liquity: string[];
}

export interface InfluenceVaultFeeConfig {
  fees: string[][];
  feeModalConfig: InfluenceVaultFeeModalConfig;
}

export interface InfluenceVaultFeeModalConfig {
  title: string;
  body: string[];
  points: InfluenceVaultPoint[];
}

export interface InfluenceVaultPoint {
  title: string[];
  body: string[];
}
