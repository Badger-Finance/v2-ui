import { LockedContractInfo } from './locked-contract-info';

// TODO: this should be moved to some interface or types folder
export interface NetworkLockedDepositsConfig {
  [chain: string]: LockedContractInfo[];
}
