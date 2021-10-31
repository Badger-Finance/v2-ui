import { RouterStore } from 'mobx-router';
import UiState from './reducers';
import WalletStore from './stores/walletStore';
import ContractsStore from './stores/contractsStore';
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
import BadgerSDK, { BadgerAPI, SDKProvider } from '@badger-dao/sdk';
import { defaultNetwork } from 'config/networks.config';
import { BADGER_API } from './utils/apiV2';
import { OnboardStore } from './stores/OnboardStore';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';

export class RootStore {
	public router: RouterStore<RootStore>;
	public api: BadgerAPI;
	public sdk?: BadgerSDK;

	public wallet: OnboardStore;

	public network: NetworkStore;
	// public wallet: WalletStore;
	public uiState: UiState;
	public contracts: ContractsStore;
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
		this.api = new BadgerAPI(defaultNetwork.id, BADGER_API);
		const config = NetworkConfig.getConfig(defaultNetwork.id);
		this.wallet = new OnboardStore(this, config);

		this.network = new NetworkStore(this);
		// this.wallet = new WalletStore(this);
		this.prices = new PricesStore(this);
		this.contracts = new ContractsStore(this);
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

	async updateNetwork(network: number) {
		this.api = new BadgerAPI(network, BADGER_API);
	}

	async updateProvider(provider: SDKProvider) {
		const {chainId} = provider.network;
		this.api = new BadgerAPI(chainId, BADGER_API);
		this.sdk = new BadgerSDK(chainId, provider, BADGER_API);
	}
}

const store = new RootStore();

export default store;
