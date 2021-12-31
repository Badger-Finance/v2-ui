import { provider } from 'web3-core';
import { EtherscanConfig } from './etherscan-config';

export interface BatchCallConfig {
  provider?: provider;
  web3?: provider;
  etherscan?: EtherscanConfig;
}
