import { VaultData, VaultDTOV3, VaultSnapshot } from '@badger-dao/sdk';

import { ChartMode } from '../../mobx/model/vaults/vault-charts';
import { DelaySeverity } from '../../mobx/model/vaults/vault-rewards';

export const ChartModeTitles: Record<string, string> = {
  [ChartMode.Value]: 'Vault Value',
  [ChartMode.Ratio]: 'Token Ratio',
  [ChartMode.AccountBalance]: 'My Holdings',
  [ChartMode.BoostMultiplier]: 'Badger Boost',
  [ChartMode.Balance]: 'Tokens Managed',
};

export const calculateDelaySeverity = (delay: number): DelaySeverity => {
  if (delay >= 4) {
    return DelaySeverity.High;
  }

  if (delay >= 2) {
    return DelaySeverity.Medium;
  }

  return DelaySeverity.None;
};

export const calculateDifferenceInHoursFromCycle = (lastUpdateTimestamp?: number): number => {
  if (!lastUpdateTimestamp) {
    return 0;
  }
  const now = Date.now() / 1000;
  // convert second differential into hour differential
  return Math.abs(now - lastUpdateTimestamp) / 3600;
};

export function defaultVaultBalance(vault: VaultDTOV3): VaultData {
  return {
    address: vault.vaultToken,
    name: vault.name,
    symbol: vault.asset,
    pricePerFullShare: vault.pricePerFullShare,
    balance: 0,
    value: 0,
    earnedBalance: 0,
    earnedValue: 0,
    depositedBalance: 0,
    withdrawnBalance: 0,
    tokens: [],
    earnedTokens: [],
  };
}

const performanceScalar = (data: VaultSnapshot) => 1 / (1 - data.strategy.performanceFee / 10_000);
export const addGrossAPR = (data: VaultSnapshot[]) => {
  const dataWithGrossAPR = data.map((data: VaultSnapshot) => ({
    ...data,
    grossApr: data.grossApr ? data.grossApr : data.apr * performanceScalar(data),
  }));
  return dataWithGrossAPR;
};
