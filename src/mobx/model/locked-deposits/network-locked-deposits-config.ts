import { Network } from '../network/network';
import { LockedContractInfo } from './locked-contract-info';

export interface NetworkLockedDepositsConfig {
  [networkId: Network['id']]: LockedContractInfo[];
}
