import { LockerFactoryType } from 'mobx/model/vaults/influence-vault-data';

import { NetworkLockedDepositsConfig } from '../mobx/model/locked-deposits/network-locked-deposits-config';
import { NETWORK_IDS } from './constants';
import fantom from './deployments/ftm.json';
import mainnet from './deployments/mainnet.json';

export const NETWORKS_LOCKED_DEPOSITS_CONFIG: NetworkLockedDepositsConfig = {
  [NETWORK_IDS.ETH]: [
    {
      vaultAddress: mainnet.sett_system.vaults['native.icvx'],
      factoryType: LockerFactoryType.CVX,
      lockingContractAddress: mainnet.cvxLocker,
    },
    {
      vaultAddress: mainnet.sett_system.vaults['native.graviaura'],
      factoryType: LockerFactoryType.AURA,
      lockingContractAddress: mainnet.auraLocker,
    },
  ],
  [NETWORK_IDS.FTM]: [
    {
      vaultAddress: fantom.sett_system.vaults['native.veoxd'],
      factoryType: LockerFactoryType.CVX,
      lockingContractAddress: fantom.veoxdLocker,
    },
  ],
};
