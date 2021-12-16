import { RootStore } from 'mobx/RootStore';
import { Initialization, API, Wallet } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify';
import Onboard from 'bnc-onboard';
import Notify, { InitOptions } from 'bnc-notify';
import { BLOCKNATIVE_API_KEY } from 'config/constants';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';
import { action, extendObservable } from 'mobx';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { SDKProvider } from '@badger-dao/sdk';
import { getOnboardWallets, isRpcWallet, onboardWalletCheck } from 'config/wallets';
import rpc from 'config/rpc.config';

const WALLET_STORAGE_KEY = 'selectedWallet';

export class OnboardStore {
	private config: NetworkConfig;
	public wallet?: Wallet;
	public onboard: API;
	public notify: NotifyAPI;
	public provider?: SDKProvider;
	public address?: string;

	constructor(private store: RootStore, config: NetworkConfig) {
		this.config = config;
		this.onboard = Onboard(this.getInitialization(config));
		const notifyOptions: InitOptions = {
			dappId: BLOCKNATIVE_API_KEY,
			networkId: config.id,
		};
		this.notify = Notify(notifyOptions);
		extendObservable(this, {
			onboard: this.onboard,
			provider: undefined,
			address: undefined,
		});
		this.connect(true);
	}

	isActive(): boolean {
		return this.address !== undefined && this.provider !== undefined;
	}

	isMetamask(): boolean {
		return this.wallet !== undefined && this.wallet.type === 'injected';
	}

	reset(): void {
		this.onboard.walletReset();
	}

	async connect(init = false): Promise<boolean> {
		const savedWallet = window.localStorage.getItem(WALLET_STORAGE_KEY);
		if (!savedWallet && init) {
			return false;
		}
		const selected = await this.onboard.walletSelect(savedWallet ?? undefined);
		if (!selected) {
			return false;
		}
		return this.onboard.walletCheck();
	}

	disconnect(): void {
		try {
			this.wallet = undefined;
			this.address = undefined;
			this.provider = undefined;
			window.localStorage.removeItem(WALLET_STORAGE_KEY);
			this.onboard.walletReset();
		} catch {} // ignore disconnect failures from provider
	}

	addressListener = action(
		async (address: string): Promise<void> => {
			const shouldUpdate = this.address !== undefined && this.address !== address;
			this.address = address;
			if (shouldUpdate && this.wallet) {
				await this.walletListener(this.wallet);
				if (this.provider) {
					await this.store.updateProvider(this.provider);
				}
			}
		},
	);

	networkListener = action(async (network: number) => {
		try {
			// trigger network check for supported networks (todo: migrate to onboard network check)
			NetworkConfig.getConfig(network);
			await this.store.updateNetwork(network);
			if (this.provider) {
				await this.store.updateProvider(this.provider);
			}
		} catch {} // do nothing on bad network change
	});

	walletListener = action(
		async (wallet: Wallet): Promise<void> => {
			this.wallet = wallet;
			if (wallet.provider) {
				this.provider = this.getProvider(this.config, wallet.provider, wallet.name);
			}
			if (wallet.name) {
				window.localStorage.setItem(WALLET_STORAGE_KEY, wallet.name);
			}
		},
	);

	private getProvider(config: NetworkConfig, provider: any, wallet: string | null): SDKProvider {
		let library;
		if (isRpcWallet(wallet)) {
			library = new JsonRpcProvider(rpc[config.network], config.id);
		} else {
			library = new Web3Provider(provider, config.id);
		}
		library.pollingInterval = 15000;
		return library;
	}

	private getInitialization(config: NetworkConfig): Initialization {
		this.config = config;
		return {
			dappId: BLOCKNATIVE_API_KEY,
			networkId: config.id,
			networkName: config.network,
			blockPollingInterval: 15000,
			darkMode: true,
			subscriptions: {
				address: this.addressListener,
				network: this.networkListener,
				wallet: this.walletListener,
			},
			walletSelect: {
				heading: 'Connect Wallet',
				description: 'WALLET',
				wallets: getOnboardWallets(config),
			},
			walletCheck: onboardWalletCheck,
		};
	}
}
