import { AbiItem } from 'web3-utils';

export type VaultNetworkConfig = {
  [index: string]:
    | {
        abi: AbiItem[];
        underlying: string;
        contracts: string[];
        fillers: {
          [index: string]: string[] | boolean[] | number[];
        };
        methods: {
          name: string;
          args?: string[];
        }[];
        growthEndpoints?: string[];
      }
    | undefined;
};
