import { RouterStore } from 'mobx-router';
import UiState from './reducers';
import WalletStore from './stores/walletStore';
import ContractsStore from './stores/contractsStore';
import AirdropStore from './stores/airdropStore';
import RebaseStore from './stores/rebaseStore';
import RewardsStore from './stores/rewardsStore';
import IbBTCStore from './stores/ibBTCStore';
import TransactionsStore from './stores/transactionsStore';
import SettStoreV2 from './stores/settStoreV2';
import { NETWORK_LIST } from '../config/constants';

export class RootStore {
	public router: RouterStore<RootStore>;
	public wallet: WalletStore;
	public uiState: UiState;
	public contracts: ContractsStore;
	public airdrops: AirdropStore;
	public rebase: RebaseStore;
	public rewards: RewardsStore;
	public ibBTCStore: IbBTCStore;
	public setts: SettStoreV2;
	public transactions: TransactionsStore;

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.wallet = new WalletStore(this);
		this.contracts = new ContractsStore(this);
		this.airdrops = new AirdropStore(this);
		this.rebase = new RebaseStore(this);
		this.rewards = new RewardsStore(this);
		this.uiState = new UiState(this);
		this.ibBTCStore = new IbBTCStore(this);
		// RenVM transactions store.
		this.transactions = new TransactionsStore(this);
		this.setts = new SettStoreV2(this);
	}

	async walletRefresh() {
		this.contracts.updateProvider();
		this.contracts.fetchContracts();
		this.airdrops.fetchAirdrops();
		this.rebase.fetchRebaseStats();
		this.rewards.fetchSettRewards();
		this.uiState.reduceStats();
		this.uiState.reduceRebase();
		this.uiState.reduceAirdrops();
		this.uiState.reduceTreeRewards();
		this.ibBTCStore.init();
		// RenVM transactions store.
		if (this.wallet.network.name === NETWORK_LIST.ETH) this.setts.loadGeysers(NETWORK_LIST.ETH);
		else this.setts.loadSetts(this.wallet.network.name);
		this.setts.loadAssets(this.wallet.network.name);
		this.setts.loadBadgerPrice();
	}
}

const store = new RootStore();

export default store;
