import UFragments from './abis/UFragments.json';
import UFragmentsPolicy from './abis/UFragmentsPolicy.json';
import MedianOracle from './abis/MedianOracle.json';
import Orchestrator from './abis/Orchestrator.json';
import DroptRedemption from './abis/DroptRedemption.json';
import { digg_system } from '../deployments/mainnet.json';
import { AbiItem } from 'web3-utils';
import { ERC20_ABI } from 'config/constants';
import { RebaseNetworkConfig } from '../../mobx/model/network/rebase-network-config';
import { Network } from '@badger-dao/sdk';

const erc20ReadCalls = [
  { reference: 'name', methodName: 'name', methodParameters: [] },
  {
    reference: 'totalSupply',
    methodName: 'totalSupply',
    methodParameters: [],
  },
  {
    reference: 'decimals',
    methodName: 'decimals',
    methodParameters: [],
  },
  { reference: 'symbol', methodName: 'symbol', methodParameters: [] },
];

export const getRebase = (network: string): RebaseNetworkConfig | undefined => {
  switch (network) {
    case Network.Ethereum:
      return {
        digg: [
          {
            reference: digg_system.uFragments,
            contractAddress: digg_system.uFragments,
            abi: UFragments.abi,
            context: { namespace: 'token' },
            calls: [
              { reference: 'name', methodName: 'name', methodParameters: [] },
              {
                reference: 'totalSupply',
                methodName: 'totalSupply',
                methodParameters: [],
              },
              {
                reference: 'decimals',
                methodName: 'decimals',
                methodParameters: [],
              },
              {
                reference: 'totalShares',
                methodName: 'totalShares',
                methodParameters: [],
              },
              {
                reference: '_sharesPerFragment',
                methodName: '_sharesPerFragment',
                methodParameters: [],
              },
              { reference: 'owner', methodName: 'owner', methodParameters: [] },
              {
                reference: 'monetaryPolicy',
                methodName: 'monetaryPolicy',
                methodParameters: [],
              },
              { reference: 'isOwner', methodName: 'isOwner', methodParameters: [] },
              { reference: 'symbol', methodName: 'symbol', methodParameters: [] },
              {
                reference: 'rebaseStartTime',
                methodName: 'rebaseStartTime',
                methodParameters: [],
              },
              {
                reference: '_initialSharesPerFragment',
                methodName: '_initialSharesPerFragment',
                methodParameters: [],
              },
            ],
          },
          {
            reference: digg_system.uFragmentsPolicy,
            contractAddress: digg_system.uFragmentsPolicy,
            abi: UFragmentsPolicy.abi,
            context: { namespace: 'policy' },
            calls: [
              {
                reference: 'minRebaseTimeIntervalSec',
                methodName: 'minRebaseTimeIntervalSec',
                methodParameters: [],
              },
              {
                reference: 'inRebaseWindow',
                methodName: 'inRebaseWindow',
                methodParameters: [],
              },
              {
                reference: 'lastRebaseTimestampSec',
                methodName: 'lastRebaseTimestampSec',
                methodParameters: [],
              },
              {
                reference: 'marketOracle',
                methodName: 'marketOracle',
                methodParameters: [],
              },
              {
                reference: 'rebaseLag',
                methodName: 'rebaseLag',
                methodParameters: [],
              },
              {
                reference: 'rebaseWindowOffsetSec',
                methodName: 'rebaseWindowOffsetSec',
                methodParameters: [],
              },
              { reference: 'owner', methodName: 'owner', methodParameters: [] },
              { reference: 'isOwner', methodName: 'isOwner', methodParameters: [] },
              { reference: 'epoch', methodName: 'epoch', methodParameters: [] },
              {
                reference: 'rebaseWindowLengthSec',
                methodName: 'rebaseWindowLengthSec',
                methodParameters: [],
              },
              {
                reference: 'cpiOracle',
                methodName: 'cpiOracle',
                methodParameters: [],
              },
              {
                reference: 'orchestrator',
                methodName: 'orchestrator',
                methodParameters: [],
              },
              { reference: 'uFrags', methodName: 'uFrags', methodParameters: [] },
              {
                reference: 'deviationThreshold',
                methodName: 'deviationThreshold',
                methodParameters: [],
              },
            ],
          },
          {
            reference: digg_system.marketMedianOracle,
            contractAddress: digg_system.marketMedianOracle,
            abi: MedianOracle.abi,
            context: { namespace: 'oracle' },
            calls: [
              {
                methodName: 'providerReports',
                methodParameters: [digg_system.chainlinkForwarder, 0],
                reference: 'providerReports',
              },
              {
                methodName: 'providerReports',
                methodParameters: [digg_system.chainlinkForwarder, 1],
                reference: 'providerReports',
              },
              {
                methodName: 'providerReports',
                methodParameters: [digg_system.chainlinkForwarder, 0],
                reference: 'providerReports',
              },
              {
                methodName: 'providerReports',
                methodParameters: [digg_system.chainlinkForwarder, 1],
                reference: 'providerReports',
              },
            ],
          },
          {
            reference: digg_system.DROPT['DROPT-2'].redemption,
            contractAddress: digg_system.DROPT['DROPT-2'].redemption,
            abi: DroptRedemption.abi,
            context: { namespace: 'dropt' },
            calls: [
              {
                methodName: 'expirationTimestamp',
                methodParameters: [],
                reference: 'expirationTimestamp',
              },
              {
                methodName: 'getCurrentTime',
                methodParameters: [],
                reference: 'getCurrentTime',
              },
              {
                methodName: 'expiryPrice',
                methodParameters: [],
                reference: 'expiryPrice',
              },
            ],
          },
          {
            reference: digg_system.DROPT['DROPT-2'].longToken,
            contractAddress: digg_system.DROPT['DROPT-2'].longToken,
            context: { namespace: 'droptToken' },
            abi: ERC20_ABI,
            calls: erc20ReadCalls,
          },
          {
            reference: digg_system.DROPT['DROPT-2'].redemption,
            contractAddress: digg_system.DROPT['DROPT-2'].redemption,
            abi: DroptRedemption.abi,
            context: { namespace: 'dropt' },
            calls: [
              {
                methodName: 'expirationTimestamp',
                methodParameters: [],
                reference: 'expirationTimestamp',
              },
              {
                methodName: 'getCurrentTime',
                methodParameters: [],
                reference: 'getCurrentTime',
              },
              {
                methodName: 'expiryPrice',
                methodParameters: [],
                reference: 'expiryPrice',
              },
            ],
          },
          {
            reference: digg_system.DROPT['DROPT-3'].longToken,
            contractAddress: digg_system.DROPT['DROPT-3'].longToken,
            context: { namespace: 'droptToken' },
            abi: ERC20_ABI,
            calls: erc20ReadCalls,
          },
          {
            reference: digg_system.DROPT['DROPT-3'].redemption,
            contractAddress: digg_system.DROPT['DROPT-3'].redemption,
            abi: DroptRedemption.abi,
            context: { namespace: 'dropt' },
            calls: [
              {
                methodName: 'expirationTimestamp',
                methodParameters: [],
                reference: 'expirationTimestamp',
              },
              {
                methodName: 'getCurrentTime',
                methodParameters: [],
                reference: 'getCurrentTime',
              },
              {
                methodName: 'expiryPrice',
                methodParameters: [],
                reference: 'expiryPrice',
              },
            ],
          },
        ],
        orchestrator: {
          reference: digg_system.orchestrator,
          contractAddress: digg_system.orchestrator,
          abi: Orchestrator.abi as AbiItem[],
          context: { namespace: 'orchestrator' },
          calls: [
            { reference: 'policy', methodName: 'policy', methodParameters: [] },
            { reference: 'owner', methodName: 'owner', methodParameters: [] },
            { reference: 'isOwner', methodName: 'isOwner', methodParameters: [] },
            {
              reference: 'transactionsSize',
              methodName: 'transactionsSize',
              methodParameters: [],
            },
            {
              reference: 'transactions',
              methodName: 'transactions',
              methodParameters: [],
            },
          ],
        },
      };
    default:
      return undefined;
  }
};

const LONG_TOKEN_MAP = {
  [digg_system.DROPT['DROPT-1'].redemption]: digg_system.DROPT['DROPT-1'].longToken,
  [digg_system.DROPT['DROPT-2'].redemption]: digg_system.DROPT['DROPT-2'].longToken,
  [digg_system.DROPT['DROPT-3'].redemption]: digg_system.DROPT['DROPT-3'].longToken,
};

export const redemptionToLongToken = (contract: string): string => {
  return LONG_TOKEN_MAP[contract];
};
