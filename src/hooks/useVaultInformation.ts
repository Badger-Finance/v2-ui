import { VaultDTOV3, VaultVersion } from '@badger-dao/sdk';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/stores/store-context';
import { useContext } from 'react';

import { getBoostContribution } from '../utils/componentHelpers';

interface VaultInformation {
  vaultBoost: number;
  boostContribution: number | null;
  depositBalance: TokenBalance;
  depositBalanceDisplay: string;
  projectedVaultBoost: number | null;
}

export function useVaultInformation(vault: VaultDTOV3): VaultInformation {
  const { user } = useContext(StoreContext);
  const { vaultToken, apy, yieldProjection } = vault;
  const { nonHarvestApy, harvestPeriodApy } = yieldProjection;

  const depositBalance = user.getBalance(vaultToken);
  const boostContribution = getBoostContribution(vault, user.accountDetails?.boost ?? 0);
  const vaultBoost = apy.grossYield + boostContribution;

  let projectedVaultBoost = null;
  if (vault.version === VaultVersion.v1_5) {
    projectedVaultBoost = harvestPeriodApy + nonHarvestApy + boostContribution;
  }

  const depositBalanceDisplay = depositBalance.balanceValueDisplay(depositBalance.balance === 0 ? 0 : 2);

  return {
    vaultBoost,
    boostContribution,
    depositBalance,
    depositBalanceDisplay,
    projectedVaultBoost,
  };
}
