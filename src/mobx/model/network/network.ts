import { TransactionData } from 'bnc-notify';
import { Currency } from 'config/enums/currency.enum';
import rpc from 'config/rpc.config';
import { getStrategies } from 'config/system/strategies';
import { SidebarLink, sidebarTokenLinks } from 'config/ui/links';
import { createChainBatchConfig } from 'web3/config/config-utils';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { SettMap } from '../setts/sett-map';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { DeployConfig } from '../system-config/deploy-config';
import { NotifyLink } from '../system-config/notifyLink';
import { BadgerSett } from '../vaults/badger-sett';
import { AirdropNetworkConfig } from './airdrop-network-config';
// TODO: the naming irony here is not lost - temporary gap for sdk integrations @jintao
import { Network as ChainNetwork, SettState } from '@badger-dao/sdk';
import { ethers } from 'ethers';

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
	readonly sidebarTokenLinks: SidebarLink[];
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
		this.sidebarTokenLinks = sidebarTokenLinks(symbol);
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

	batchRequests(setts: SettMap, address: string): BatchCallRequest[] {
		return this.getNetworkBatchRequests(setts, address);
	}

	getNetworkBatchRequests = (setts: SettMap, userAddress: string): BatchCallRequest[] => {
		const tokenAddresses = Object.values(setts).map((sett) => sett.underlyingToken);
		const settAddresses = Object.values(setts).map((sett) => sett.settToken);
		const generalSetts = settAddresses.filter((sett) => setts[sett].state === SettState.Open);
		const guardedSetts = settAddresses.filter((sett) => setts[sett].state !== SettState.Open);
		return createChainBatchConfig(tokenAddresses, generalSetts, guardedSetts, [], userAddress);
	};

	private checksumSetts(setts: BadgerSett[]): BadgerSett[] {
		return setts.map((sett) => {
			sett.depositToken.address = ethers.utils.getAddress(sett.depositToken.address);
			sett.vaultToken.address = ethers.utils.getAddress(sett.vaultToken.address);
			if (sett.geyser) {
				sett.geyser = ethers.utils.getAddress(sett.geyser);
			}
			return sett;
		});
	}
}
