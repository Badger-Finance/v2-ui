import BadgerTree from './abis/BadgerTree.json';
import { AbiItem } from 'web3-utils';
import { getApi } from '../../mobx/utils/apiV2';
import { badgerTree, tokens, sett_system } from '../deployments/mainnet.json';
import { RewardNetworkConfig } from '../../mobx/model/network/reward-network-config';
import { Network } from '@badger-dao/sdk';

export const getRewards = (network?: string): RewardNetworkConfig | undefined => {
  switch (network) {
    case Network.Ethereum:
      return {
        endpoint: `${getApi()}/reward/tree`,
        network: 1,
        contract: badgerTree,
        abi: BadgerTree.abi as AbiItem[],
        tokens: [
          tokens.badger,
          tokens.digg,
          sett_system.vaults['native.badger'],
          sett_system.vaults['native.digg'],
          tokens.xsushi,
          tokens.farm,
          tokens.usdc,
          tokens.defiDollar,
          sett_system.vaults['native.cvxCrv'],
          sett_system.vaults['native.cvx'],
        ],
      };
    default:
      return undefined;
  }
};
