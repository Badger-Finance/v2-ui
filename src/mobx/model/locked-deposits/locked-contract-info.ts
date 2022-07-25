import { LockerFactoryType } from '../vaults/influence-vault-data';

export interface LockedContractInfo {
  vaultAddress: string;
  factoryType: LockerFactoryType;
  lockingContractAddress: string;
}
