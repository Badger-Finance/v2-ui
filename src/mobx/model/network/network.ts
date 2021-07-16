import { BadgerSett } from '../vaults/badger-sett';
import { BatchCallRequest } from '../../../web3/interface/batch-call-request';
import { ProtocolTokens } from '../../../web3/interface/protocol-token';
import { RebaseNetworkConfig } from './rebase-network-config';
import { AirdropNetworkConfig } from './airdrop-network-config';
import { RewardNetworkConfig } from './reward-network-config';
import { SidebarLink } from '../../../config/ui/links';
import { EmitterListener } from 'bnc-notify';
import { StrategyNetworkConfig } from '../strategies/strategy-network-config';
import { SettMap } from '../setts/sett-map';
import { DeployConfig } from '../system-config/deploy-config';
import { GasPrices } from '../system-config/gas-prices';

export interface Network {
	name: string;
	networkId: number;
	fullName: string;
	setts: BadgerSett[];
	batchRequests: (setts: SettMap, address: string) => BatchCallRequest[];
	tokens: ProtocolTokens;
	rebase: RebaseNetworkConfig | undefined;
	airdrops: AirdropNetworkConfig[];
	deploy: DeployConfig;
	rewards: RewardNetworkConfig | undefined;
	currency: string;
	gasEndpoint: string;
	sidebarTokenLinks: SidebarLink[];
	sidebarPricingLinks: SidebarLink[];
	settOrder: string[];
	getGasPrices: () => Promise<GasPrices>;
	getNotifyLink: EmitterListener;
	isWhitelisted: { [index: string]: boolean };
	cappedDeposit: { [index: string]: boolean };
	uncappedDeposit: { [index: string]: boolean };
	newVaults: { [index: string]: string[] };
	strategies: StrategyNetworkConfig;
	getFees: (vaultAddress: string) => string[];
}
