import { TransactionData } from 'bnc-notify';
import { Currency } from 'config/enums/currency.enum';
import rpc from 'config/rpc.config';
import { getAirdrops } from 'config/system/airdrops';
import { getStrategies } from 'config/system/strategies';
import Web3 from 'web3';
import { createBalancesRequest } from 'web3/config/config-utils';
import { SettMap } from '../setts/sett-map';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { DeployConfig } from '../system-config/deploy-config';
import { NotifyLink } from '../system-config/notifyLink';
import { BadgerSett } from '../vaults/badger-sett';
import { AirdropNetworkConfig } from './airdrop-network-config';
// TODO: the naming irony here is not lost - temporary gap for sdk integrations @jintao
import { Network as ChainNetwork, SettState } from '@badger-dao/sdk';
import { ContractCallContext } from 'ethereum-multicall';
import { BadgerToken } from '../tokens/badger-token';

export abstract class Network {
	private static idToNetwork: Record<number, Network> = {};
	private static symbolToNetwork: Record<string, Network> = {};
	readonly rpc: string;
	readonly gasProviderUrl: string;
	readonly explorer: string;
	readonly name: string;
	readonly symbol: ChainNetwork;
	readonly id: number;
	readonly currency: Currency;
	readonly deploy: DeployConfig;
	readonly setts: BadgerSett[];
	readonly strategies: StrategyNetworkConfig;
	readonly airdrops: AirdropNetworkConfig[];
	readonly tokens: BadgerToken[];
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
		setts: BadgerSett[],
		tokens?: BadgerToken[],
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
		this.setts = this.checksumSetts(setts);
		this.strategies = getStrategies(symbol);
		this.airdrops = getAirdrops(symbol);
		this.tokens = tokens ?? [];
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
		return this.setts.map((s) => s.vaultToken.address);
	}

	notifyLink(transaction: TransactionData): NotifyLink {
		return { link: `${this.explorer}/tx/${transaction.hash}` };
	}

	getBalancesRequests(setts: SettMap, userAddress: string): ContractCallContext[] {
		const tokenAddresses = Object.values(setts).map((sett) => sett.underlyingToken);
		const settAddresses = Object.values(setts).map((sett) => sett.settToken);
		const generalSettAddresses = settAddresses.filter((sett) => setts[sett].state === SettState.Open);
		const guardedSettAddresses = settAddresses.filter(
			(sett) => setts[sett].state === SettState.Guarded || setts[sett].state === SettState.Experimental,
		);
		const deprecatedSettAddresses = settAddresses.filter((sett) => setts[sett].state === SettState.Deprecated);
		const allContracts = new Set(
			...[...tokenAddresses, ...settAddresses, ...generalSettAddresses, ...guardedSettAddresses],
		);
		for (const token of this.tokens) {
			if (!allContracts.has(token.address)) {
				tokenAddresses.push(token.address);
			}
		}
		return createBalancesRequest({
			tokenAddresses,
			generalSettAddresses,
			guardedSettAddresses,
			deprecatedSettAddresses,
			userAddress,
		});
	}

	private checksumSetts(setts: BadgerSett[]): BadgerSett[] {
		return setts.map((sett) => {
			sett.depositToken.address = Web3.utils.toChecksumAddress(sett.depositToken.address);
			sett.vaultToken.address = Web3.utils.toChecksumAddress(sett.vaultToken.address);
			if (sett.geyser) {
				sett.geyser = Web3.utils.toChecksumAddress(sett.geyser);
			}
			return sett;
		});
	}
}
