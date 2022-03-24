import { RouterStore } from 'mobx-router';
import UiStateStore from './stores/uiStore';
import ContractsStore from './stores/contractsStore';
import RebaseStore from './stores/rebaseStore';
import RewardsStore from './stores/rewardsStore';
import IbBTCStore from './stores/ibBTCStore';
import VaultStore from './stores/VaultStore';
import GasPricesStore from './stores/GasPricesStore';
import { NETWORK_IDS } from '../config/constants';
import { HoneyPotStore } from './stores/honeyPotStore';
import UserStore from './stores/UserStore';
import PricesStore from './stores/PricesStore';
import { NetworkStore } from './stores/NetworkStore';
import { VaultDetailStore } from './stores/VaultDetail.store';
import { VaultChartsStore } from './stores/VaultChartsStore';
import LockedCvxDelegationStore from './stores/lockedCvxDelegationStore';
import { BadgerSDK, SDKProvider } from '@badger-dao/sdk';
import { defaultNetwork } from 'config/networks.config';
import { BADGER_API } from './utils/apiV2';
import { OnboardStore } from './stores/OnboardStore';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';
import { Network } from './model/network/network';
import { Currency } from '../config/enums/currency.enum';
import routes from 'config/routes';
import BondStore from './stores/BondStore';
import rpc from '../config/rpc.config';
import { FLAGS } from '../config/environment';
import { GovernancePortalStore } from './stores/GovernancePortalStore';

export class RootStore {
	public sdk: BadgerSDK;
	public router: RouterStore<RootStore>;
	public network: NetworkStore;
	public uiState: UiStateStore;
	public contracts: ContractsStore;
	public rebase: RebaseStore;
	public onboard: OnboardStore;
	public rewards: RewardsStore;
	public ibBTCStore: IbBTCStore;
	public vaults: VaultStore;
	public honeyPot: HoneyPotStore;
	public user: UserStore;
	public prices: PricesStore;
	public vaultDetail: VaultDetailStore;
	public vaultCharts: VaultChartsStore;
	public lockedCvxDelegation: LockedCvxDelegationStore;
	public gasPrices: GasPricesStore;
	public bondStore: BondStore;
	public governancePortal: GovernancePortalStore;

	constructor() {
		// this is passed as a dummy rpc - it will never be used unless required by an rpc wallet, e.g.: wallet connect
		this.sdk = new BadgerSDK({
			network: defaultNetwork.id,
			provider: rpc[defaultNetwork.symbol],
			baseURL: BADGER_API,
		});
		const config = NetworkConfig.getConfig(defaultNetwork.id);
		this.router = new RouterStore<RootStore>(this);
		this.onboard = new OnboardStore(this, config);
		this.network = new NetworkStore(this);
		this.prices = new PricesStore(this);
		this.contracts = new ContractsStore(this);
		this.rebase = new RebaseStore(this);
		this.rewards = new RewardsStore(this);
		this.uiState = new UiStateStore(this);
		this.vaults = new VaultStore(this);
		this.user = new UserStore(this);
		this.honeyPot = new HoneyPotStore(this);
		this.vaultDetail = new VaultDetailStore(this);
		this.vaultCharts = new VaultChartsStore(this);
		this.lockedCvxDelegation = new LockedCvxDelegationStore(this);
		this.gasPrices = new GasPricesStore(this);
		this.ibBTCStore = new IbBTCStore(this);
		this.bondStore = new BondStore(this);
		this.governancePortal = new GovernancePortalStore(this);
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

		if (this.onboard.provider && this.network.network.hasBadgerTree) {
			refreshData = refreshData.concat([this.rewards.loadTreeData(), this.rebase.fetchRebaseStats()]);
		}

		await Promise.all(refreshData);
	}

	async updateProvider(provider: SDKProvider): Promise<void> {
		this.rewards.resetRewards();
		const { address } = this.onboard;
		const { network } = this.network;
		const signer = provider.getSigner();

		if (FLAGS.SDK_USE_WALLET_PROVIDER) {
			this.sdk = new BadgerSDK({ network: network.id, provider, baseURL: BADGER_API });
		}

		if (signer && address) {
			const config = NetworkConfig.getConfig(network.id);

			const updateActions = [
				this.user.loadAccountDetails(address),
				this.user.loadClaimProof(address, config.network),
				this.lockedCvxDelegation.loadTotalCVXWithdrawable(),
			];

			if (network.id === NETWORK_IDS.ETH || network.id === NETWORK_IDS.LOCAL) {
				// handle per page reloads, when init route is skipped
				if (this.router.currentPath === routes.IbBTC.path) {
					updateActions.push(this.ibBTCStore.init());
				}

				if (this.router.currentPath === routes.citadel.path) {
					updateActions.push(this.bondStore.updateBonds());
				}
			}

			await Promise.all([Promise.all(updateActions), this.user.reloadBalances(address)]);
		}
	}
}

const store = new RootStore();

export default store;
