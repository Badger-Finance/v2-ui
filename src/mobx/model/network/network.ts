// TODO: the naming irony here is not lost - temporary gap for sdk integrations @jintao
import { Currency, Network as ChainNetwork } from '@badger-dao/sdk';
import rpc from 'config/rpc.config';
import { getStrategies } from 'config/system/strategies';
import { ethers } from 'ethers';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';

import { DeployConfig } from '../system-config/deploy-config';
import { BadgerVault } from '../vaults/badger-vault';

export abstract class Network {
	private static idToNetwork: Record<number, Network> = {};
	private static symbolToNetwork: Record<string, Network> = {};
	readonly rpc: string;
	readonly gasProviderUrl: string;
	readonly explorer: string;
	// disabled for new lint - out of scope
	/* eslint-disable-next-line no-restricted-globals */
	readonly name: string;
	readonly symbol: ChainNetwork;
	readonly id: number;
	readonly currency: Currency;
	readonly deploy: DeployConfig;
	readonly vaults: BadgerVault[];
	readonly strategies: StrategyNetworkConfig;
	// TODO: stop gap implementation for API messaging system - remove once available
	readonly notification?: string;
	readonly notificationLink?: string;

	constructor(
		explorer: string,
		gasProviderUrl: string,
		name: string,
		symbol: ChainNetwork,
		id: number,
		currency: Currency,
		deploy: DeployConfig,
		setts: BadgerVault[],
		notification?: string,
		notificationLink?: string,
	) {
		this.rpc = rpc[symbol];
		this.gasProviderUrl = gasProviderUrl;
		this.explorer = explorer;
		this.name = name;
		this.symbol = symbol;
		this.id = id;
		this.currency = currency;
		this.deploy = deploy;
		this.vaults = this.checksumVaults(setts);
		this.strategies = getStrategies(symbol);
		this.notification = notification;
		this.notificationLink = notificationLink;
		Network.register(this);
	}

	static register(network: Network): void {
		Network.idToNetwork[network.id] = network;
		Network.symbolToNetwork[network.symbol] = network;
	}

	static networkFromId(id: number): Network {
		return Network.idToNetwork[id];
	}

	static networkFromSymbol(symbol: string): Network {
		return Network.symbolToNetwork[symbol];
	}

	get settOrder(): string[] {
		return this.vaults.map((s) => s.vaultToken.address);
	}

	private checksumVaults(vaults: BadgerVault[]): BadgerVault[] {
		return vaults.map((vault) => {
			vault.depositToken.address = ethers.utils.getAddress(vault.depositToken.address);
			vault.vaultToken.address = ethers.utils.getAddress(vault.vaultToken.address);
			if (vault.geyser) {
				vault.geyser = ethers.utils.getAddress(vault.geyser);
			}
			return vault;
		});
	}
}
