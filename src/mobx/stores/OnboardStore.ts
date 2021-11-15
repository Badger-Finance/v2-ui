import { RootStore } from 'mobx/RootStore';
import { Initialization, API, Wallet } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify';
import Onboard from 'bnc-onboard';
import Notify, { InitOptions } from 'bnc-notify';
import { BLOCKNATIVE_API_KEY } from 'config/constants';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';
import { action, extendObservable } from 'mobx';
import { Web3Provider } from '@ethersproject/providers';
import { SDKProvider } from '@badger-dao/sdk';
import { getOnboardWallets, onboardWalletCheck } from 'config/wallets';

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

	async connect(): Promise<boolean> {
		const selected = await this.onboard.walletSelect();
		if (!selected) {
			return false;
		}
		return this.onboard.walletCheck();
	}

	disonnect(): void {
		try {
			this.wallet = undefined;
			this.address = undefined;
			this.provider = undefined;
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
			if (wallet.provider || wallet.instance) {
				this.provider = this.getProvider(wallet.provider ?? wallet.instance);
			}
		},
	);

	private getProvider(provider: any): Web3Provider {
		const library = new Web3Provider(
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
				heading: 'Connect to BadgerDAO',
				description: 'Deposit & Earn on your Bitcoin',
				wallets: getOnboardWallets(config),
			},
			walletCheck: onboardWalletCheck,
		};
	}
}
