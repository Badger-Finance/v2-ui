import { RouterStore } from 'mobx-router';
import UiState from './reducers';
import WalletStore from './stores/walletStore';
import ContractsStore from './stores/contractsStore';
import AirdropStore from './stores/airdropStore';
import RebaseStore from './stores/rebaseStore';
import RewardsStore from './stores/rewardsStore';
import IbBTCStore from './stores/ibBTCStore';
import BridgeStore from './stores/bridgeStore';
import SettStore from './stores/SettStore';
import { NETWORK_IDS } from '../config/constants';
import { HoneyPotStore } from './stores/honeyPotStore';
import UserStore from './stores/UserStore';
import { LeaderBoardStore } from './stores/LeaderBoardStore';
import PricesStore from './stores/PricesStore';
import { NetworkStore } from './stores/NetworkStore';
import { SettDetailStore } from './stores/SettDetail.store';
import { SettChartsStore } from './stores/SettChartsStore';
import LockedCvxDelegationStore from './stores/lockedCvxDelegationStore';

export class RootStore {
	public router: RouterStore<RootStore>;
	public network: NetworkStore;
	public wallet: WalletStore;
	public uiState: UiState;
	public contracts: ContractsStore;
	public airdrops: AirdropStore;
	public rebase: RebaseStore;
	public rewards: RewardsStore;
	public ibBTCStore: IbBTCStore;
	public setts: SettStore;
	public bridge: BridgeStore;
	public honeyPot: HoneyPotStore;
	public user: UserStore;
	public leaderBoard: LeaderBoardStore;
	public prices: PricesStore;
	public settDetail: SettDetailStore;
	public settCharts: SettChartsStore;
	public lockedCvxDelegation: LockedCvxDelegationStore;

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.network = new NetworkStore(this);
		this.wallet = new WalletStore(this);
		this.prices = new PricesStore(this);
		this.contracts = new ContractsStore(this);
		this.airdrops = new AirdropStore(this);
		this.rebase = new RebaseStore(this);
		this.rewards = new RewardsStore(this);
		this.uiState = new UiState(this);
		this.ibBTCStore = new IbBTCStore(this);
		// RenVM bridge store.
		this.bridge = new BridgeStore(this);
		this.honeyPot = new HoneyPotStore(this);
		this.setts = new SettStore(this);
		this.user = new UserStore(this);
		this.leaderBoard = new LeaderBoardStore(this);
		this.settDetail = new SettDetailStore(this);
		this.settCharts = new SettChartsStore(this);
		this.lockedCvxDelegation = new LockedCvxDelegationStore(this);
	}

	async walletRefresh(): Promise<void> {
		if (!this.wallet.connectedAddress) {
			return;
		}

		const { network } = this.network;
		this.rewards.resetRewards();

		const refreshData = [
			this.setts.loadAssets(network.symbol),
			this.network.updateGasPrices(),
			this.setts.loadSetts(network.symbol),
			this.loadTreeData(),
		];

		await Promise.all(refreshData);

		if (this.wallet.connectedAddress) {
			if (network.id === NETWORK_IDS.ETH) {
				this.ibBTCStore.init();
				await this.airdrops.fetchAirdrops();
			}
		}
	}

	private async loadTreeData() {
		const { network } = this.network;
		// ensure network required calls are made prior to loading rewards
		if (network.id === NETWORK_IDS.ETH) {
			await this.rebase.fetchRebaseStats();
		}
		if (network.hasBadgerTree) {
			await this.rewards.loadTreeData();
		}
	}
}

const store = new RootStore();

export default store;
