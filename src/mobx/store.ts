import { RouterStore } from 'mobx-router';
import UiState from './stores/uiStore';
import WalletStore from './stores/walletStore';
import ContractsStore from './stores/contractsStore';

export class RootStore {
	public router: RouterStore<RootStore>;
	public wallet: WalletStore;
	public uiState: UiState;
	public contracts: ContractsStore;

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.wallet = new WalletStore(this);
		this.contracts = new ContractsStore(this);
		this.uiState = new UiState(this);
	}
}

const store = new RootStore();

export default store;