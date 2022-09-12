import { VaultDTOV3 } from '@badger-dao/sdk';
import { ethers } from 'ethers';

import { StrategyFee } from '../model/system-config/stategy-fees';

export function getVaultStrategyFee(vault: VaultDTOV3, fee: StrategyFee): number {
  const { strategy } = vault;
  if (strategy.address === ethers.constants.AddressZero) {
    return 0;
  }
  switch (fee) {
    case StrategyFee.withdraw:
      return strategy.withdrawFee;
    case StrategyFee.performance:
      return strategy.performanceFee;
    case StrategyFee.strategistPerformance:
      return strategy.strategistFee;
    case StrategyFee.aumFee:
      return strategy.aumFee;
    default:
      return 0;
  }
}
