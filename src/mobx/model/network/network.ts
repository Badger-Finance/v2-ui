import { TransactionData } from 'bnc-notify';
import { Currency } from 'config/enums/currency.enum';
import rpc from 'config/rpc.config';
import { getAirdrops } from 'config/system/airdrops';
import { getStrategies } from 'config/system/strategies';
import Web3 from 'web3';
import { createBalancesRequest } from 'web3/config/config-utils';
import { VaultMap } from '../vaults/vault-map';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { DeployConfig } from '../system-config/deploy-config';
import { NotifyLink } from '../system-config/notifyLink';
import { BadgerVault } from '../vaults/badger-vault';
import { AirdropNetworkConfig } from './airdrop-network-config';
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
	readonly airdrops: AirdropNetworkConfig[];
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
		this.airdrops = getAirdrops(symbol);
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
		const tokenAddresses: string[] = []; // Object.values(vaults).map((vault) => vault.underlyingToken);
		const vaultAddresses: string[] = []; // Object.values(vaults).map((vault) => vault.vaultToken);
		const generalVaultAddresses = vaultAddresses.filter((vault) => vaults[vault].state === VaultState.Open);
		const guardedVaultAddresses = vaultAddresses.filter(
			(vault) => vaults[vault].state === VaultState.Guarded || vaults[vault].state === VaultState.Experimental,
		);
		const deprecatedVaultAddresses = vaultAddresses.filter(
			(vault) => vaults[vault].state === VaultState.Deprecated,
		);
		const allContracts = new Set(
			...[...tokenAddresses, ...vaultAddresses, ...generalVaultAddresses, ...guardedVaultAddresses],
		);
		for (const token of Object.keys(tokens)) {
			if (!allContracts.has(token)) {
				tokenAddresses.push(token);
			}
		}
		// TODO: REMOVE LOCAL CITADEL TEST BALANCES (FORK NET)
		tokenAddresses.push('0x1f10F3Ba7ACB61b2F50B9d6DdCf91a6f787C0E82');
		tokenAddresses.push('0x525C7063E7C20997BaaE9bDa922159152D0e8417');
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
