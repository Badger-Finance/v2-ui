import { AbiItem } from 'web3-utils';

export type AirdropNetworkConfig = {
  active: boolean;
  endpoint: string;
  token: string;
  tokenAbi: AbiItem[];
  airdropContract: string;
  airdropAbi: AbiItem[];
};
