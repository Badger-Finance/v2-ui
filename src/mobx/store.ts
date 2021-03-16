import { RouterStore } from 'mobx-router';
import UiState from './reducers';
import WalletStore from './stores/walletStore';
import ContractsStore from './stores/contractsStore';
import AirdropStore from './stores/airdropStore';
import RebaseStore from './stores/rebaseStore';
import RewardsStore from './stores/rewardsStore';
import IbBTCStore from './stores/ibBTCStore';
import SettStore from './stores/settStore';
import TransactionsStore from './stores/transactionsStore';
import SettStoreV2 from './stores/settStoreV2';

export class RootStore {
	public router: RouterStore<RootStore>;
	public wallet: WalletStore;
	public uiState: UiState;
	public contracts: ContractsStore;
	public airdrops: AirdropStore;
	public rebase: RebaseStore;
	public rewards: RewardsStore;
	public ibBTCStore: IbBTCStore;
	public sett: SettStore;
	public setts: SettStoreV2;
	public transactions: TransactionsStore;

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.wallet = new WalletStore();
		this.contracts = new ContractsStore(this);
		this.airdrops = new AirdropStore(this);
		this.rebase = new RebaseStore(this);
		this.rewards = new RewardsStore(this);
		this.uiState = new UiState(this);
		this.ibBTCStore = new IbBTCStore(this);
		this.sett = new SettStore(this);
		// RenVM transactions store.
		this.transactions = new TransactionsStore(this);
		this.setts = new SettStoreV2(this);
	}
}

const store = new RootStore();

export default store;
