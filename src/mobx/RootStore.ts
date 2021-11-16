import { RouterStore } from 'mobx-router';
import UiState from './reducers';
import ContractsStore from './stores/contractsStore';
import AirdropStore from './stores/airdropStore';
import RebaseStore from './stores/rebaseStore';
import RewardsStore from './stores/rewardsStore';
import IbBTCStore from './stores/ibBTCStore';
import BridgeStore from './stores/bridgeStore';
import SettStore from './stores/SettStore';
import GasPricesStore from './stores/GasPricesStore';
import { NETWORK_IDS } from '../config/constants';
import { HoneyPotStore } from './stores/honeyPotStore';
import UserStore from './stores/UserStore';
import { LeaderBoardStore } from './stores/LeaderBoardStore';
import PricesStore from './stores/PricesStore';
import { NetworkStore } from './stores/NetworkStore';
import { SettDetailStore } from './stores/SettDetail.store';
import { SettChartsStore } from './stores/SettChartsStore';
import LockedCvxDelegationStore from './stores/lockedCvxDelegationStore';
import { BadgerAPI, SDKProvider } from '@badger-dao/sdk';
import { defaultNetwork } from 'config/networks.config';
import { BADGER_API } from './utils/apiV2';
import { OnboardStore } from './stores/OnboardStore';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';
import { Network } from './model/network/network';

export class RootStore {
	public api: BadgerAPI;
	public router: RouterStore<RootStore>;
	public network: NetworkStore;
	public uiState: UiState;
	public contracts: ContractsStore;
	public airdrops: AirdropStore;
	public rebase: RebaseStore;
	public onboard: OnboardStore;
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
	public gasPrices: GasPricesStore;

	constructor() {
		this.api = new BadgerAPI(defaultNetwork.id, BADGER_API);
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
		this.gasPrices = new GasPricesStore(this);
	}

	async updateNetwork(network: number): Promise<void> {
		if (this.network.network.id !== network) {
			const appNetwork = Network.networkFromId(network);
			this.network.network = appNetwork;
		}
		this.api = new BadgerAPI(network, BADGER_API);
		this.rewards.resetRewards();

		const refreshData = [
			this.network.updateGasPrices(),
			this.setts.refresh(),
			this.prices.loadPrices(),
			this.leaderBoard.loadData(),
		];
		if (this.onboard.isActive() && network === NETWORK_IDS.ETH) {
			refreshData.push(this.rewards.loadTreeData());
			this.bridge.updateContracts();
		}

		await Promise.all(refreshData);
	}

	async updateProvider(provider: SDKProvider): Promise<void> {
		const { network } = this.network;
		const signer = provider.getSigner();
		let updateActions: Promise<void>[] = [];
		this.rewards.resetRewards();
		if (signer && this.onboard.address) {
			const address = await signer.getAddress();
			const config = NetworkConfig.getConfig(network.id);
			updateActions = updateActions.concat([
				this.user.loadAccountDetails(address),
				this.user.reloadBalances(address),
				this.user.loadClaimProof(this.onboard.address, config.network),
			]);
		}
		if (network.id === NETWORK_IDS.ETH) {
			updateActions = updateActions.concat([this.airdrops.fetchAirdrops(), this.rebase.fetchRebaseStats()]);
		}
		await Promise.all(updateActions);
	}
}

const store = new RootStore();

export default store;
