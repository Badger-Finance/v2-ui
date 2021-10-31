import { RootStore } from "mobx/RootStore";
import { Initialization, API, Wallet, Ens } from "bnc-onboard/dist/src/interfaces";
import Onboard from 'bnc-onboard';
import { BLOCKNATIVE_API_KEY } from "config/constants";
import { NetworkConfig } from "@badger-dao/sdk/lib/config/network/network.config";
import { action, makeAutoObservable } from "mobx";
import { JsonRpcBatchProvider } from "@ethersproject/providers";
import { SDKProvider } from "@badger-dao/sdk";

export class OnboardStore {
  private onboard: API;
	private wallet?: Wallet;
	public provider?: SDKProvider;
	public address?: string;

  constructor(private store: RootStore, config: NetworkConfig)  {
		const initialization: Initialization = {
			dappId: BLOCKNATIVE_API_KEY,
			networkId: config.id,
      networkName: config.network,
      blockPollingInterval: 15000,
			darkMode: true,
			subscriptions: {
				address: this.addressListener,
				ens: this.ensListener,
				network: this.networkListener,
				balance: this.balanceListener,
				wallet: this.walletListener,
			},
			walletSelect: {
			},
		};
    this.onboard = Onboard(initialization);
		makeAutoObservable(this);
  }

	isMetamask() {
		return this.wallet !== undefined && this.wallet.type === 'injected';
	}

	async ready() {
		return this.onboard.walletCheck();
	}

	async reset() {
		this.onboard.walletReset();
	}

	async connect() {
		await this.onboard.walletSelect();
	}

	addressListener = action(async (address: string) => {
		this.address = address;
	});

	ensListener = action(async (ens: Ens) => {

	});

	networkListener = action(async (network: number) => {
		// add a network update hook on the root store
		await this.store.updateNetwork(network);
	});

	balanceListener = action(async (balance: string) => {

	});

	walletListener = action(async (wallet: Wallet) => {
		// add a wallet update hook on the root store
		this.wallet = wallet;
		this.provider = this.getProvider(wallet.provider);
		await this.store.updateProvider(this.provider);
	});

	private getProvider(provider: any): JsonRpcBatchProvider {
		const library = new JsonRpcBatchProvider(
			provider,
			typeof provider.chainId === 'number'
				? provider.chainId
				: typeof provider.chainId === 'string'
				? parseInt(provider.chainId)
				: 'any',
		);
		library.pollingInterval = 15000;
		return library;
	}
}