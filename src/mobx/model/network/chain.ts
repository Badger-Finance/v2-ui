import { Currency, Network as ChainNetwork, Network } from '@badger-dao/sdk';
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
  readonly symbol: ChainNetwork;
  readonly id: number;
  readonly currency: Currency;
  readonly deploy: Deploy;
  readonly vaults: BadgerVault[];
  readonly strategies: StrategyNetworkConfig;
  // TODO: stop gap implementation for API messaging system - remove once available
  readonly notification?: string;
  readonly notificationLink?: string;

  constructor(
    explorer: string,
    name: string,
    symbol: ChainNetwork,
    id: number,
    currency: Currency,
    deploy: Deploy,
    vaults: BadgerVault[],
    notification?: string,
    notificationLink?: string,
  ) {
    this.rpc = rpc[symbol];
    this.explorer = explorer;
    this.name = name;
    this.symbol = symbol;
    this.id = id;
    this.currency = currency;
    this.deploy = deploy;
    this.vaults = vaults;
    this.strategies = getStrategies(symbol);
    this.notification = notification;
    this.notificationLink = notificationLink;
    Chain.chains[symbol] = this;
  }

  static getChain(network: Network) {
    return Chain.chains[network];
  }

  get vaultOrder(): string[] {
    return this.vaults.map((s) => s.vaultToken.address);
  }
}
