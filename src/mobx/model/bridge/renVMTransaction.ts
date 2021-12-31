import { TransferParamsCommon, ContractCall, LockAndMintStatus, BurnAndReleaseStatus } from '@renproject/interfaces';
import firebase from 'firebase';

export interface RenVMParams extends TransferParamsCommon, ContractCall {}

export type RenVMTransaction = {
  // ID is the pkey in the db.
  id: string;
  user: string;
  nonce: string;
  encodedTx: string; // json encoded tx data.
  // NB: The web3Provider field is not encoded (for obvious reasons).
  params: RenVMParams;
  renVMStatus: LockAndMintStatus | BurnAndReleaseStatus | null;
  renVMMessage?: string;
  mintGateway: string | null;
  txHash?: string;
  mintChainHash?: string;
  status: string;
  // Record if there was an error processing a tx.
  error: string;
  updated: firebase.firestore.Timestamp;
  created: firebase.firestore.Timestamp;
  deleted: boolean;
};
