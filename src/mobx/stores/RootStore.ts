import { BadgerSDK, getNetworkConfig, SDKProvider } from '@badger-dao/sdk';
import { defaultNetwork } from 'config/networks.config';
import routes from 'config/routes';
import { RouterStore } from 'mobx-router';

import { NETWORK_IDS } from '../../config/constants';
import { Currency } from '../../config/enums/currency.enum';
import { FLAGS } from '../../config/environment';
import rpc from '../../config/rpc.config';
import { Network } from '../model/network/network';
import { BADGER_API } from '../utils/apiV2';
import ContractsStore from './contractsStore';
import GasPricesStore from './GasPricesStore';
import { GovernancePortalStore } from './GovernancePortalStore';
import IbBTCStore from './ibBTCStore';
import LockedCvxDelegationStore from './lockedCvxDelegationStore';
import LockedDepositsStore from './LockedDepositsStore';
import { NetworkStore } from './NetworkStore';
import { OnboardStore } from './OnboardStore';
import PricesStore from './PricesStore';
import RebaseStore from './rebaseStore';
import RewardsStore from './rewardsStore';
import UiStateStore from './uiStore';
import UserStore from './UserStore';
import { VaultChartsStore } from './VaultChartsStore';
import { VaultDetailStore } from './VaultDetail.store';
import VaultStore from './VaultStore';
import { WalletStore } from './WalletStore';

export class RootStore {
	public sdk: BadgerSDK;
	public router: RouterStore<RootStore>;
	public network: NetworkStore;
	public uiState: UiStateStore;
	public contracts: ContractsStore;
	public rebase: RebaseStore;
	public onboard: OnboardStore;
	public wallet: WalletStore;
	public rewards: RewardsStore;
	public ibBTCStore: IbBTCStore;
	public vaults: VaultStore;
	public user: UserStore;
	public prices: PricesStore;
	public vaultDetail: VaultDetailStore;
	public vaultCharts: VaultChartsStore;
	public lockedCvxDelegation: LockedCvxDelegationStore;
	public gasPrices: GasPricesStore;
	public governancePortal: GovernancePortalStore;
	public lockedDeposits: LockedDepositsStore;

	constructor() {
		// this is passed as a dummy rpc - it will never be used unless required by an rpc wallet, e.g.: wallet connect
		this.sdk = new BadgerSDK({
			network: defaultNetwork.id,
			provider: rpc[defaultNetwork.symbol],
			baseURL: BADGER_API,
		});
		const config = getNetworkConfig(defaultNetwork.id);
		this.router = new RouterStore<RootStore>(this);
		this.onboard = new OnboardStore(this, config);
		this.wallet = new WalletStore(this, config);
		this.network = new NetworkStore(this);
		this.prices = new PricesStore(this);
		this.contracts = new ContractsStore(this);
		this.rebase = new RebaseStore(this);
		this.rewards = new RewardsStore(this);
		this.uiState = new UiStateStore(this);
		this.vaults = new VaultStore(this);
		this.user = new UserStore(this);
		this.vaultDetail = new VaultDetailStore(this);
		this.vaultCharts = new VaultChartsStore(this);
		this.lockedCvxDelegation = new LockedCvxDelegationStore(this);
		this.gasPrices = new GasPricesStore(this);
		this.ibBTCStore = new IbBTCStore(this);
		this.governancePortal = new GovernancePortalStore(this);
		this.lockedDeposits = new LockedDepositsStore(this);
	}

	async updateNetwork(network: number): Promise<void> {
		const appNetwork = Network.networkFromId(network);

		// push network state to app
		if (this.network.network.id !== network) {
			this.network.network = appNetwork;
		}

		this.uiState.setCurrency(Currency.USD);
		this.sdk = new BadgerSDK({ network, provider: rpc[appNetwork.symbol], baseURL: BADGER_API });
		this.rewards.resetRewards();

		if (FLAGS.SDK_INTEGRATION_ENABLED) {
			await this.sdk.ready();
		}

		let refreshData = [this.network.updateGasPrices(), this.vaults.refresh(), this.prices.loadPrices()];

		if (this.network.network.hasBadgerTree) {
			refreshData = refreshData.concat([this.rewards.loadTreeData(), this.rebase.fetchRebaseStats()]);
		}

		await Promise.all(refreshData);
	}

	async updateProvider(provider: SDKProvider): Promise<void> {
		this.rewards.resetRewards();
		const { address } = this.wallet;
		const { network } = this.network;
		const signer = provider.getSigner();

		this.sdk = new BadgerSDK({ network: network.id, provider, baseURL: BADGER_API });

		if (signer && address) {
			const config = getNetworkConfig(network.id);

			const updateActions = [
				this.user.loadAccountDetails(address),
				this.user.loadClaimProof(address, config.network),
				this.lockedDeposits.loadLockedBalances(),
			];

			if (network.id === NETWORK_IDS.ETH || network.id === NETWORK_IDS.LOCAL) {
				// handle per page reloads, when init route is skipped
				if (this.router.currentRoute?.path === routes.IbBTC.path) {
					updateActions.push(this.ibBTCStore.init());
				}
			}

			await Promise.all([Promise.all(updateActions), this.user.reloadBalances(address)]);
		}
	}
}

const store = new RootStore();

export default store;
