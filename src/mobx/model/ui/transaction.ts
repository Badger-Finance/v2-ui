import { TransactionReceipt } from '@ethersproject/abstract-provider';

export interface TransactionMeta {
  addedTime: number;
  name: string;
  description?: string;
}

export interface Transaction extends TransactionMeta {
  receipt?: TransactionReceipt;
  hash: string;
}
