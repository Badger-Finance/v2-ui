import { Network } from './network';
import { FLAGS, NETWORK_IDS, NETWORK_LIST } from '../../../config/constants';
import { ethProtocolTokens, ethSetts, getEthereumBatchRequests } from '../../../web3/config/eth-config';
import { getRebase } from '../../../config/system/rebase';
import { getAirdrops } from '../../../config/system/airdrops';
import { getNetworkDeploy } from '../../utils/network';
import { getRewards } from '../../../config/system/rewards';
import { TransactionData } from 'bnc-notify';
import { getStrategies } from '../../../config/system/strategies';
import { sidebarPricingLinks, sidebarTokenLinks } from 'config/ui/links';
import { GasPrices } from '../system-config/gas-prices';
import { NotifyLink } from '../system-config/notifyLink';
import { getFeesFromStrategy } from '../../utils/fees';

export class EthNetwork implements Network {
	readonly name = NETWORK_LIST.ETH;
	readonly networkId = NETWORK_IDS.ETH;
	readonly fullName = 'Ethereum';
	readonly setts = ethSetts;
	readonly batchRequests = getEthereumBatchRequests;
	readonly tokens = ethProtocolTokens;
	readonly rebase = getRebase(NETWORK_LIST.ETH);
	readonly airdrops = getAirdrops(NETWORK_LIST.ETH);
	readonly deploy = getNetworkDeploy(NETWORK_LIST.ETH);
	readonly rewards = getRewards(NETWORK_LIST.ETH);
	readonly currency = 'ETH';
	readonly gasEndpoint = 'https://www.gasnow.org/api/v3/gas/price?utm_source=badgerv2';
	readonly sidebarTokenLinks = sidebarTokenLinks(NETWORK_LIST.ETH);
	readonly sidebarPricingLinks = sidebarPricingLinks;
	readonly isWhitelisted = {};
	readonly cappedDeposit = {};
	readonly uncappedDeposit = {
		[this.deploy.sett_system.vaults['yearn.wBtc']]: true,
	};
	readonly newVaults = {};
	readonly strategies = getStrategies(NETWORK_LIST.ETH);

	// Deterministic order for displaying setts on the sett list component
	readonly settOrder = [
		this.deploy.sett_system.vaults['native.cvxCrv'],
		this.deploy.sett_system.vaults['native.cvx'],
		this.deploy.sett_system.vaults['native.tricryptoCrv'],
		this.deploy.sett_system.vaults['native.sbtcCrv'],
		this.deploy.sett_system.vaults['native.renCrv'],
		this.deploy.sett_system.vaults['native.tbtcCrv'],
		this.deploy.sett_system.vaults['native.hbtcCrv'],
		this.deploy.sett_system.vaults['native.pbtcCrv'],
		this.deploy.sett_system.vaults['native.obtcCrv'],
		this.deploy.sett_system.vaults['native.bbtcCrv'],
		this.deploy.sett_system.vaults['native.sushiibBTCwBTC'],
		this.deploy.sett_system.vaults['yearn.wBtc'],
		this.deploy.sett_system.vaults['native.digg'],
		this.deploy.sett_system.vaults['native.badger'],
		this.deploy.sett_system.vaults['native.sushiDiggWbtc'],
		this.deploy.sett_system.vaults['native.sushiBadgerWbtc'],
		this.deploy.sett_system.vaults['native.sushiWbtcEth'],
		this.deploy.sett_system.vaults['native.uniDiggWbtc'],
		this.deploy.sett_system.vaults['native.uniBadgerWbtc'],
		this.deploy.sett_system.vaults['harvest.renCrv'],
		...(FLAGS.STABILIZATION_SETTS ? [this.deploy.sett_system.vaults['experimental.digg']] : []),
	];

	public async getGasPrices(): Promise<GasPrices> {
		const prices = await fetch('https://www.gasnow.org/api/v3/gas/price?utm_source=badgerv2');
		const result = await prices.json();
		return {
			rapid: result.data['rapid'] / 1e9,
			fast: result.data['fast'] / 1e9,
			standard: result.data['standard'] / 1e9,
			slow: result.data['slow'] / 1e9,
		};
	}

	public getNotifyLink(transaction: TransactionData): NotifyLink {
		return { link: `https://etherscan.io/tx/${transaction.hash}` };
	}

	public getFees(vaultAddress: string): string[] {
		return getFeesFromStrategy(this.strategies[vaultAddress]);
	}
}
