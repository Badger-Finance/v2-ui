import { TransactionData } from 'bnc-notify';
import { ChainNetwork } from 'config/enums/chain-network.enum';
import { Currency } from 'config/enums/currency.enum';
import rpc from 'config/rpc.config';
import { getAirdrops } from 'config/system/airdrops';
import { getStrategies } from 'config/system/strategies';
import { SidebarLink, sidebarTokenLinks } from 'config/ui/links';
import Web3 from 'web3';
import { createChainBatchConfig } from 'web3/config/config-utils';
import { BatchCallRequest } from 'web3/interface/batch-call-request';
import { SettMap } from '../setts/sett-map';
import { SettState } from '../setts/sett-state';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { DeployConfig } from '../system-config/deploy-config';
import { GasPrices } from '../system-config/gas-prices';
import { NotifyLink } from '../system-config/notifyLink';
import { BadgerSett } from '../vaults/badger-sett';
import { AirdropNetworkConfig } from './airdrop-network-config';

export abstract class Network {
	private static idToNetwork: Record<number, Network> = {};
	private static symbolToNetwork: Record<string, Network> = {};
	readonly rpc: string;
	readonly explorer: string;
	readonly name: string;
	readonly symbol: ChainNetwork;
	readonly id: number;
	readonly currency: Currency;
	readonly deploy: DeployConfig;
	readonly setts: BadgerSett[];
	readonly strategies: StrategyNetworkConfig;
	readonly airdrops: AirdropNetworkConfig[];
	readonly sidebarTokenLinks: SidebarLink[];

	constructor(
		explorer: string,
		name: string,
		symbol: ChainNetwork,
		id: number,
		currency: Currency,
		deploy: DeployConfig,
		setts: BadgerSett[],
	) {
		this.rpc = rpc[symbol];
		this.explorer = explorer;
		this.name = name;
		this.symbol = symbol;
		this.id = id;
		this.currency = currency;
		this.deploy = deploy;
		this.setts = this.checksumSetts(setts);
		this.strategies = getStrategies(symbol);
		this.airdrops = getAirdrops(symbol);
		this.sidebarTokenLinks = sidebarTokenLinks(symbol);
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

	abstract updateGasPrices(): Promise<GasPrices>;

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
		const nonSettTokenAddresses = [''];
		const settAddresses = Object.values(setts).map((sett) => sett.vaultToken);
		const generalSetts = settAddresses.filter((sett) => setts[sett].state === SettState.Open);
		const guardedSetts = settAddresses.filter((sett) => setts[sett].state !== SettState.Open);
		return createChainBatchConfig(
			tokenAddresses,
			nonSettTokenAddresses,
			generalSetts,
			guardedSetts,
			[],
			userAddress,
		);
	};

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
