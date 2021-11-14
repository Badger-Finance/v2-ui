import { RootStore } from 'mobx/RootStore';
import { Initialization, API, Wallet, Ens } from 'bnc-onboard/dist/src/interfaces';
import Onboard from 'bnc-onboard';
import { BLOCKNATIVE_API_KEY } from 'config/constants';
import { NetworkConfig } from '@badger-dao/sdk/lib/config/network/network.config';
import { action, extendObservable } from 'mobx';
import { Web3Provider } from '@ethersproject/providers';
import { SDKProvider } from '@badger-dao/sdk';

export class OnboardStore {
	public wallet?: Wallet;
	public onboard: API;
	public provider?: SDKProvider;
	public address?: string;

	constructor(private store: RootStore, config: NetworkConfig) {
		const initialization: Initialization = {
			dappId: BLOCKNATIVE_API_KEY,
			networkId: config.id,
			networkName: config.network,
			blockPollingInterval: 15000,
			darkMode: true,
			subscriptions: {
				address: this.addressListener,
				// ens: this.ensListener,
				network: this.networkListener,
				balance: this.balanceListener,
				wallet: this.walletListener,
			},
			walletSelect: {},
		};
		this.onboard = Onboard(initialization);
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

	async ready(): Promise<boolean> {
		return this.onboard.walletSelect();
	}

	async connect(): Promise<boolean> {
		await this.ready();
		return this.onboard.walletCheck();
	}

	addressListener = action(
		async (address: string): Promise<void> => {
			const shouldUpdate = this.address !== address;
			this.address = address;
			if (shouldUpdate && this.wallet) {
				await this.walletListener(this.wallet);
			}
			// this.address = '0xc3fd1227DA579220Afeb28B400DaCC4Ad6523c7c'; // address;
		},
	);

	/* eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
	// ensListener = action(async (_ens: Ens): Promise<void> => {});

	networkListener = action(async (network: number) => {
		await this.store.updateNetwork(network);
		if (this.provider) {
			await this.store.updateProvider(this.provider);
		}
	});

	/* eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
	balanceListener = action(async (_balance: string): Promise<void> => {});

	walletListener = action(
		async (wallet: Wallet): Promise<void> => {
			this.wallet = wallet;
			this.provider = this.getProvider(wallet.provider);
			const providerNetwork = await this.provider.getNetwork();
			const network = NetworkConfig.getConfig(providerNetwork.chainId);
			this.store.network.setNetwork(network.id);
			await this.store.updateProvider(this.provider);
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
}
