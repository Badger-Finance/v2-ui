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
import { NETWORK_LIST } from '../config/constants';
import { HoneyPotStore } from './stores/honeyPotStore';
import UserStore from './stores/UserStore';
import { LeaderBoardStore } from './stores/LeaderBoardStore';
import { getNetworkFromProvider } from './utils/helpers';
import PricesStore from './stores/PricesStore';

export class RootStore {
	public router: RouterStore<RootStore>;
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

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.wallet = new WalletStore(this);
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
		this.prices = new PricesStore(this);
	}

	async walletRefresh(): Promise<void> {
		if (!this.wallet.connectedAddress) {
			return;
		}

		const chain = getNetworkFromProvider(this.wallet.provider);

		if (chain) {
			this.rewards.resetRewards();
			const refreshData = [this.setts.loadAssets(chain), this.wallet.getGasPrice(), this.setts.loadSetts(chain)];
			if (chain === NETWORK_LIST.ETH) {
				refreshData.push(this.rebase.fetchRebaseStats());
				refreshData.push(this.rewards.loadTreeData());
			}
			await Promise.all(refreshData);

			if (this.wallet.connectedAddress) {
				if (chain === NETWORK_LIST.ETH) {
					this.ibBTCStore.init();
					this.airdrops.fetchAirdrops();
				}
			}
		}
	}
}

const store = new RootStore();

export default store;
