import { TransactionData } from 'bnc-notify';
import { Network } from './network';
import { NETWORK_IDS, NETWORK_LIST } from '../../../config/constants';
import { bscProtocolTokens, bscSetts } from '../../../web3/config/bsc-config';
import { getNetworkBatchRequests } from '../../../web3/config/eth-config';
import { getRebase } from '../../../config/system/rebase';
import { getAirdrops } from '../../../config/system/airdrops';
import { getNetworkDeploy } from '../../utils/network';
import { getRewards } from '../../../config/system/rewards';
import { getStrategies } from '../../../config/system/strategies';
import { sidebarPricingLinks, sidebarTokenLinks } from 'config/ui/links';
import { GasPrices } from '../system-config/gas-prices';
import { NotifyLink } from '../system-config/notifyLink';
import { getFeesFromStrategy } from '../../utils/fees';

export class BscNetwork implements Network {
	readonly name = NETWORK_LIST.BSC;
	readonly networkId = NETWORK_IDS.BSC;
	readonly fullName = 'Binance Smart Chain';
	readonly setts = bscSetts;
	readonly batchRequests = getNetworkBatchRequests;
	readonly tokens = bscProtocolTokens;
	readonly rebase = getRebase(NETWORK_LIST.BSC);
	readonly airdrops = getAirdrops(NETWORK_LIST.BSC);
	readonly deploy = getNetworkDeploy(NETWORK_LIST.BSC);
	readonly rewards = getRewards(NETWORK_LIST.BSC);
	readonly currency = 'BNB';
	readonly gasEndpoint = '';
	readonly isWhitelisted = {};
	readonly cappedDeposit = {};
	readonly uncappedDeposit = {};
	readonly newVaults = {};
	readonly strategies = getStrategies(NETWORK_LIST.BSC);
	readonly sidebarTokenLinks = sidebarTokenLinks(NETWORK_LIST.BSC);
	readonly sidebarPricingLinks = sidebarPricingLinks;

	// Deterministic order for displaying setts on the sett list component
	readonly settOrder = [
		this.deploy.sett_system.vaults['native.bDiggBtcb'],
		this.deploy.sett_system.vaults['native.bBadgerBtcb'],
		this.deploy.sett_system.vaults['native.pancakeBnbBtcb'],
		this.deploy.sett_system.vaults['yearn.wBtc'],
	];

	public async getGasPrices(): Promise<GasPrices> {
		return { standard: 5 };
	}

	public getNotifyLink(transaction: TransactionData): NotifyLink {
		return { link: `https://bscscan.com//tx/${transaction.hash}` };
	}

	public getFees(vaultAddress: string): string[] {
		return getFeesFromStrategy(this.strategies[vaultAddress]);
	}
}
