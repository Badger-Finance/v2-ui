import { TransactionData } from 'bnc-notify';
import { Currency } from 'config/enums/currency.enum';
import rpc from 'config/rpc.config';
import { getStrategies } from 'config/system/strategies';
import Web3 from 'web3';
import { createBalancesRequest } from 'web3/config/config-utils';
import { VaultMap } from '../vaults/vault-map';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { DeployConfig } from '../system-config/deploy-config';
import { NotifyLink } from '../system-config/notifyLink';
import { BadgerVault } from '../vaults/badger-vault';
// TODO: the naming irony here is not lost - temporary gap for sdk integrations @jintao
import { Network as ChainNetwork, VaultState, TokenConfiguration } from '@badger-dao/sdk';
import { ContractCallContext } from 'ethereum-multicall';

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

	get hasBadgerTree(): boolean {
		return !!this.deploy.badgerTree;
	}

	get badgerTree(): string {
		return this.deploy.badgerTree;
	}

	get settOrder(): string[] {
		return this.vaults.map((s) => s.vaultToken.address);
	}

	notifyLink(transaction: TransactionData): NotifyLink {
		return { link: `${this.explorer}/tx/${transaction.hash}` };
	}

	getBalancesRequests(vaults: VaultMap, tokens: TokenConfiguration, userAddress: string): ContractCallContext[] {
		let tokenAddresses = Object.values(vaults).map((vault) => vault.underlyingToken);
		const vaultAddresses = Object.values(vaults).map((vault) => vault.vaultToken);
		const generalVaultAddresses = vaultAddresses.filter((vault) => vaults[vault].state === VaultState.Open);
		const guardedVaultAddresses = vaultAddresses.filter(
			(vault) => vaults[vault].state === VaultState.Guarded || vaults[vault].state === VaultState.Experimental,
		);
		const deprecatedVaultAddresses = vaultAddresses.filter(
			(vault) => vaults[vault].state === VaultState.Deprecated,
		);
		const allVaults = new Set([...generalVaultAddresses, ...guardedVaultAddresses, ...deprecatedVaultAddresses]);
		for (const token of Object.keys(tokens).filter((t) => !tokenAddresses.includes(t))) {
			if (!allVaults.has(token)) {
				tokenAddresses.push(token);
			}
		}
		// remove duplicate requests to cut down on calls
		tokenAddresses = tokenAddresses.filter((t) => !allVaults.has(t));
		return createBalancesRequest({
			tokenAddresses,
			generalVaultAddresses,
			guardedVaultAddresses,
			deprecatedVaultAddresses,
			userAddress,
		});
	}

	private checksumVaults(vaults: BadgerVault[]): BadgerVault[] {
		return vaults.map((vault) => {
			vault.depositToken.address = Web3.utils.toChecksumAddress(vault.depositToken.address);
			vault.vaultToken.address = Web3.utils.toChecksumAddress(vault.vaultToken.address);
			if (vault.geyser) {
				vault.geyser = Web3.utils.toChecksumAddress(vault.geyser);
			}
			return vault;
		});
	}
}
