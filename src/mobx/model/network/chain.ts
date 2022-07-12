import { Currency, Network } from '@badger-dao/sdk';
import rpc from 'config/rpc.config';
import { getStrategies } from 'config/system/strategies';
import { Deploy } from 'web3/deploy';

import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { BadgerVault } from '../vaults/badger-vault';

export abstract class Chain {
  private static chains: Record<string, Chain> = {};

  readonly rpc: string;
  readonly explorer: string;
  // disabled for new lint - out of scope
  /* eslint-disable-next-line no-restricted-globals */
  readonly name: string;
  readonly network: Network;
  readonly id: number;
  readonly currency: Currency;
  readonly deploy: Deploy;
  // readonly vaults: BadgerVault[];
  readonly strategies: StrategyNetworkConfig;
  // TODO: stop gap implementation for API messaging system - remove once available
  readonly notification?: string;
  readonly notificationLink?: string;

  constructor(
    explorer: string,
    name: string,
    network: Network,
    id: number,
    currency: Currency,
    deploy: Deploy,
    vaults: BadgerVault[],
    notification?: string,
    notificationLink?: string,
  ) {
    this.rpc = rpc[network];
    this.explorer = explorer;
    this.name = name;
    this.network = network;
    this.id = id;
    this.currency = currency;
    this.deploy = deploy;
    // this.vaults = vaults;
    this.strategies = getStrategies(network);
    this.notification = notification;
    this.notificationLink = notificationLink;
    Chain.chains[network] = this;
  }

  static getChain(network: Network) {
    return Chain.chains[network];
  }

  vaultOrder(): string[] {
    return [];
  }
}
