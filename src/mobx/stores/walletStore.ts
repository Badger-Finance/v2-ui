import { extendObservable, action } from 'mobx';
import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';
import BigNumber from 'bignumber.js';
import { onboardWalletCheck, getOnboardWallets } from '../../config/wallets';
import { RootStore } from 'mobx/RootStore';
import { API } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify';
import { getNetworkFromProvider } from 'mobx/utils/helpers';
import { Network } from 'mobx/model/network/network';

class WalletStore {
	private store: RootStore;
	public onboard: API;
	public notify: NotifyAPI;
	public provider?: any | null;
	public connectedAddress = '';

	constructor(store: RootStore) {
		this.store = store;

		const onboardOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: this.store.network.network.id,
			darkMode: true,
			subscriptions: {
				address: this.setAddress,
				wallet: this.cacheWallet,
				network: this.store.network.checkNetwork,
			},
			walletSelect: {
				heading: 'Connect to BadgerDAO',
				description: 'Deposit & Earn on your Bitcoin',
				wallets: getOnboardWallets(this.store.network.network),
			},
			walletCheck: onboardWalletCheck,
		};
		const onboard = Onboard(onboardOptions);

		const notifyOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: this.store.network.network.id,
		};
		const notify = Notify(notifyOptions);

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: { slow: 51, standard: 75, rapid: 122 },
			ethBalance: new BigNumber(0),
			onboard: onboard,
			notify: notify,
		});

		// set defaults
		this.onboard = onboard;
		this.notify = notify;
		this.provider = null;
		this.init();
	}

	init = action(
		async (): Promise<void> => {
			setInterval(() => {
				this.store.network.getCurrentBlock();
			}, 5000 * 60);
			const previouslySelectedWallet = window.localStorage.getItem('selectedWallet');

			// call wallet select with that value if it exists
			if (!!previouslySelectedWallet) {
				const walletSelected = await this.onboard.walletSelect(previouslySelectedWallet);
				let walletReady = false;
				try {
					walletReady = await this.onboard.walletCheck();
				} catch (err) {
					this.onboard.walletReset();
					return;
				}

				if (walletSelected && walletReady) {
					this.connect(this.onboard);
				} else {
					this.walletReset();
				}
			}
			this.notify.config({
				darkMode: true,
			});
		},
	);

	walletReset = action((): void => {
		try {
			if (this.store.user.loadingBalances) {
				return;
			}
			this.onboard.walletReset();
			this.setProvider(null);
			this.setAddress('');
			window.localStorage.removeItem('selectedWallet');
		} catch (err) {
			console.log(err);
		}
	});

	connect = action((wsOnboard: any) => {
		this.onboard = wsOnboard;
		const walletState = wsOnboard.getState();
		this.setProvider(walletState.wallet.provider);
		this.setAddress(walletState.address);
	});

	getCurrentNetwork(): string | undefined {
		// not all the providers have the chainId prop available so we use the app network id as fallback
		if (!this.provider || !this.provider.chainId) {
			const id = this.onboard.getState().appNetworkId;
			return Network.networkFromId(id).symbol;
		}
		return getNetworkFromProvider(this.provider);
	}

	setProvider = action((provider: any) => {
		this.provider = provider;
		this.store.network.getCurrentBlock();
	});

	setAddress = action(
		async (address: string): Promise<void> => {
			const isCurrentNetworkSupported = Boolean(this.getCurrentNetwork());

			if (isCurrentNetworkSupported) {
				this.connectedAddress = address;
				await this.store.walletRefresh();
			} else {
				this.connectedAddress = '';
			}
		},
	);

	cacheWallet = action((wallet: any) => {
		this.setProvider(wallet.provider);
		window.localStorage.setItem('selectedWallet', wallet.name);
	});

	isCached = action(() => {
		return !!this.connectedAddress || !!window.localStorage.getItem('selectedWallet');
	});

	/* Network should be checked based on the provider.  You can either provide a provider
	 * if the current one is not set or it's a new one, or use the current set provider by
	 * not passing in a value.
	 * @param provider = optional web3 provider to check if valid
	 */
	// Reason: blocknative does not type their provider, must be any
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	checkSupportedNetwork = (provider?: any): boolean => {
		const name = getNetworkFromProvider(provider ?? this.provider);
		return !!name;
	};
}

export default WalletStore;
