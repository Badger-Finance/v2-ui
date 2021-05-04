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

		this.walletRefresh();
	}

	async walletRefresh(): Promise<void> {
		const chain = this.wallet.network.name;
		if (this.wallet.connectedAddress) {
			this.contracts.updateProvider();
			await this.contracts.fetchContracts();
			if (chain === NETWORK_LIST.ETH) {
				this.uiState.reduceRebase();
				this.ibBTCStore.init();
				this.rewards.fetchSettRewards();
				this.uiState.reduceTreeRewards();
				this.airdrops.fetchAirdrops();
				this.uiState.reduceAirdrops();
			}
			this.uiState.reduceStats();
		}

		const refreshData = [
			this.setts.loadAssets(chain),
			this.setts.loadPrices(chain),
			this.wallet.getGasPrice(),
			this.contracts.updateProvider(),
			this.setts.loadSetts(chain),
		];
		if (chain === NETWORK_LIST.ETH) {
			refreshData.push(this.rebase.fetchRebaseStats());
		}
		await Promise.all(refreshData);
	}
}

const store = new RootStore();

export default store;
