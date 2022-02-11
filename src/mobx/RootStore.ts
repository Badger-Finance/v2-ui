import { RouterStore } from 'mobx-router';
import UiState from './reducers';
import ContractsStore from './stores/contractsStore';
import AirdropStore from './stores/airdropStore';
import RebaseStore from './stores/rebaseStore';
import RewardsStore from './stores/rewardsStore';
import IbBTCStore from './stores/ibBTCStore';
import BridgeStore from './stores/bridgeStore';
import VaultStore from './stores/VaultStore';
import GasPricesStore from './stores/GasPricesStore';
import { NETWORK_IDS } from '../config/constants';
import { HoneyPotStore } from './stores/honeyPotStore';
import UserStore from './stores/UserStore';
import { LeaderBoardStore } from './stores/LeaderBoardStore';
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
import { JsonRpcProvider } from '@ethersproject/providers';
import rpc from '../config/rpc.config';
import { FLAGS } from '../config/environment';

export class RootStore {
	public badgerSDK: BadgerSDK;
	public router: RouterStore<RootStore>;
	public network: NetworkStore;
	public uiState: UiState;
	public contracts: ContractsStore;
	public airdrops: AirdropStore;
	public rebase: RebaseStore;
	public onboard: OnboardStore;
	public rewards: RewardsStore;
	public ibBTCStore: IbBTCStore;
	public vaults: VaultStore;
	public bridge: BridgeStore;
	public honeyPot: HoneyPotStore;
	public user: UserStore;
	public leaderBoard: LeaderBoardStore;
	public prices: PricesStore;
	public vaultDetail: VaultDetailStore;
	public vaultCharts: VaultChartsStore;
	public lockedCvxDelegation: LockedCvxDelegationStore;
	public gasPrices: GasPricesStore;
	public bondStore: BondStore;

	constructor() {
		this.badgerSDK = new BadgerSDK(defaultNetwork.id, new JsonRpcProvider(rpc[defaultNetwork.symbol]), BADGER_API);
		const config = NetworkConfig.getConfig(defaultNetwork.id);
		this.router = new RouterStore<RootStore>(this);
		this.onboard = new OnboardStore(this, config);
		this.network = new NetworkStore(this);
		this.prices = new PricesStore(this);
		this.contracts = new ContractsStore(this);
		this.airdrops = new AirdropStore(this);
		this.rebase = new RebaseStore(this);
		this.rewards = new RewardsStore(this);
		this.uiState = new UiState(this);
		this.vaults = new VaultStore(this);
		this.user = new UserStore(this);
		// RenVM bridge store.
		this.bridge = new BridgeStore(this);
		this.honeyPot = new HoneyPotStore(this);
		this.leaderBoard = new LeaderBoardStore(this);
		this.vaultDetail = new VaultDetailStore(this);
		this.vaultCharts = new VaultChartsStore(this);
		this.lockedCvxDelegation = new LockedCvxDelegationStore(this);
		this.gasPrices = new GasPricesStore(this);
		this.ibBTCStore = new IbBTCStore(this);
		this.bondStore = new BondStore(this);
	}

	async updateNetwork(network: number): Promise<void> {
		const appNetwork = Network.networkFromId(network);

		// push network state to app
		if (this.network.network.id !== network) {
			this.network.network = appNetwork;
		}

		this.uiState.setCurrency(Currency.USD);
		this.badgerSDK = new BadgerSDK(network, new JsonRpcProvider(rpc[appNetwork.symbol]), BADGER_API);
		this.rewards.resetRewards();

		let refreshData: Promise<void | void[]>[] = [
			this.network.updateGasPrices(),
			this.vaults.refresh(),
			this.prices.loadPrices(),
			this.leaderBoard.loadData(),
		];

		if (FLAGS.SDK_INTEGRATION_ENABLED) {
			await this.badgerSDK.ready();
			refreshData.push(this.vaults.loadVaultsRegistry());
		}

		if (this.onboard.provider && this.network.network.hasBadgerTree) {
			refreshData = refreshData.concat([this.rewards.loadTreeData(), this.rebase.fetchRebaseStats()]);
		}

		if (this.onboard.isActive() && network === NETWORK_IDS.ETH) {
			this.bridge.updateContracts();
		}

		await Promise.all(refreshData);
	}

	async updateProvider(provider: SDKProvider): Promise<void> {
		this.rewards.resetRewards();
		const { address } = this.onboard;
		const { network } = this.network;
		const signer = provider.getSigner();

		if (signer && address) {
			const config = NetworkConfig.getConfig(network.id);

			const updateActions = [
				this.user.loadAccountDetails(address),
				this.user.loadClaimProof(address, config.network),
				this.user.checkApprovalVulnerabilities(address),
			];

			if (network.id === NETWORK_IDS.ETH || network.id === NETWORK_IDS.LOCAL) {
				updateActions.push(this.airdrops.fetchAirdrops());

				// handle per page reloads, when init route is skipped
				if (this.router.currentPath === routes.IbBTC.path) {
					updateActions.push(this.ibBTCStore.init());
				}

				if (this.router.currentPath === routes.citadel.path) {
					updateActions.push(this.bondStore.updateBonds());
				}
			}

			if (this.bridge.isBridgeSupported()) {
				if (this.router.currentPath === routes.bridge.path) {
					updateActions.push(this.bridge.reload());
				}
			}

			await Promise.all([Promise.all(updateActions), this.user.reloadBalances(address)]);
		}
	}
}

const store = new RootStore();

export default store;
