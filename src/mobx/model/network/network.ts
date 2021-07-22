import { TransactionData } from 'bnc-notify';
import rpc from 'config/rpc.config';
import { getAirdrops } from 'config/system/airdrops';
import { getStrategies } from 'config/system/strategies';
import { SidebarLink, sidebarTokenLinks } from 'config/ui/links';
import { getFeesFromStrategy } from 'mobx/utils/fees';
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
	readonly symbol: string;
	readonly id: number;
	readonly currency: string;
	readonly deploy: DeployConfig;
	readonly setts: BadgerSett[];
	readonly strategies: StrategyNetworkConfig;
	readonly airdrops: AirdropNetworkConfig[];
	readonly sidebarTokenLinks: SidebarLink[];

	constructor(
		explorer: string,
		name: string,
		symbol: string,
		id: number,
		currency: string,
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
		this.setts = setts;
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

	get settOrder(): string[] {
		return this.setts.map((s) => s.vaultToken.address);
	}

	notifyLink(transaction: TransactionData): NotifyLink {
		return { link: `${this.explorer}/tx/${transaction.hash}` };
	}

	batchRequests(setts: SettMap, address: string): BatchCallRequest[] {
		return this.getNetworkBatchRequests(setts, address);
	}

	getFees(vaultToken: string): string[] {
		return getFeesFromStrategy(this.strategies[vaultToken]);
	}

	getNetworkBatchRequests = (setts: SettMap, userAddress: string): BatchCallRequest[] => {
		const tokenAddresses = Object.values(setts).map((sett) => sett.underlyingToken);
		const settAddresses = Object.values(setts).map((sett) => sett.vaultToken);
		const generalSetts = settAddresses.filter((sett) => setts[sett].state === SettState.Open);
		const guardedSetts = settAddresses.filter((sett) => setts[sett].state !== SettState.Open);
		return createChainBatchConfig(tokenAddresses, generalSetts, guardedSetts, [], userAddress);
	};
}
