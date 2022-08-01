import { VaultDTO, VaultVersion } from '@badger-dao/sdk';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { StoreContext } from 'mobx/stores/store-context';
import { useContext } from 'react';

import { getProjectedVaultBoost, getUserVaultBoost, isBadgerSource } from '../utils/componentHelpers';

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
  const depositBalance = user.getBalance(vault.vaultToken);
  let vaultBoost = showAPR ? vault.apr : vault.apy;

  let projectedBaseApr = 0;
  if (vault.version === VaultVersion.v1_5) {
    projectedBaseApr = vault.yieldProjection.harvestTokensPerPeriod
      .filter((s) => !isBadgerSource(s))
      .reduce((total, s) => (total += s.apr), 0);
  }

  let projectedVaultBoost = projectedBaseApr > 0 ? projectedBaseApr : null;
  if (user.accountDetails?.boost) {
    vaultBoost = getUserVaultBoost(vault, user.accountDetails.boost, showAPR);
    if (projectedVaultBoost) {
      projectedVaultBoost += getProjectedVaultBoost(vault, user.accountDetails.boost);
    }
  }

  const boostContribution =
    vaultBoost && vault.minApy && vault.minApr
      ? Math.max(0, vaultBoost - (showAPR ? vault.minApr : vault.minApy))
      : null;

  const depositBalanceDisplay = depositBalance.balanceValueDisplay(depositBalance.balance === 0 ? 0 : 2);

  return {
    vaultBoost,
    boostContribution,
    depositBalance,
    depositBalanceDisplay,
    projectedVaultBoost,
  };
}
