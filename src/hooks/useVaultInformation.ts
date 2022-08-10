import { VaultDTO, VaultVersion } from '@badger-dao/sdk';
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

export function useVaultInformation(vault: VaultDTO): VaultInformation {
  const { user, vaults } = useContext(StoreContext);
  const { showAPR } = vaults.vaultsFilters;
  const { vaultToken, apr, minApr, apy, minApy, yieldProjection } = vault;
  const { nonHarvestApr, nonHarvestApy, harvestPeriodApr, harvestPeriodApy } = yieldProjection;

  const depositBalance = user.getBalance(vaultToken);
  const boostContribution = getBoostContribution(vault, user.accountDetails?.boost ?? 0);

  const sourceApr = minApr ?? apr;
  const sourceApy = minApy ?? apy;
  const baseYield = showAPR ? sourceApr : sourceApy;
  const vaultBoost = baseYield + boostContribution;

  let projectedVaultBoost = null;
  if (vault.version === VaultVersion.v1_5) {
    const baseHarvestYield = showAPR ? harvestPeriodApr : harvestPeriodApy;
    const nonHarvestYield = showAPR ? nonHarvestApr : nonHarvestApy;
    projectedVaultBoost = baseHarvestYield + nonHarvestYield + boostContribution;
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
