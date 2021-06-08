import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';
import BigNumber from 'bignumber.js';
import { onboardWalletCheck, getOnboardWallets, isRpcWallet } from '../../config/wallets';
import { GasPrices, Network } from 'mobx/model';
import { RootStore } from 'mobx/store';
import { API } from 'bnc-onboard/dist/src/interfaces';
import { API as NotifyAPI } from 'bnc-notify';
import { getNetwork, getNetworkNameFromId } from 'mobx/utils/network';
import { getNetworkFromProvider } from 'mobx/utils/helpers';

class WalletStore {
	private store: RootStore;
	public onboard: API;
	public notify: NotifyAPI;
	public provider?: any | null;
	public connectedAddress = '';
	public currentBlock?: number;
	public gasPrices: GasPrices;
	public network: Network;

	constructor(store: RootStore) {
		this.network = getNetwork();
		this.gasPrices = { standard: 10 };
		this.store = store;

		const onboardOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: this.network.networkId,
			darkMode: true,
			subscriptions: {
				address: this.setAddress,
				wallet: this.cacheWallet,
				network: this.checkNetwork,
			},
			walletSelect: {
				heading: 'Connect to BadgerDAO',
				description: 'Deposit & Earn on your Bitcoin',
				wallets: getOnboardWallets(this.network.name),
			},
			walletCheck: onboardWalletCheck,
		};
		const onboard = Onboard(onboardOptions);

		const notifyOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: this.network.networkId,
		};
		const notify = Notify(notifyOptions);

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: { slow: 51, standard: 75, rapid: 122 },
			ethBalance: new BigNumber(0),
			network: this.network,
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
			this.getCurrentBlock();
			await this.getGasPrice();

			setInterval(() => {
				this.getGasPrice();
			}, 13000);
			setInterval(() => {
				this.getCurrentBlock();
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
				darkMode: true, // (default: false)
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
		// change of adress trigger onboard event subscription, reconnecting does not.
		// TODO: fix root cause of this, this fix introduces an error when disconnecting and reconnecting
		// the same wallet address.
		this.setAddress(walletState.address);
	});

	getCurrentBlock = action(() => {
		if (!this.provider) {
			return;
		}
		const web3 = new Web3(this.provider);
		web3.eth.getBlockNumber().then((value: number) => {
			this.currentBlock = value - 50;
		});
	});

	getGasPrice = action(async () => {
		this.gasPrices = await this.network.getGasPrices();
		// Some networks have variable prices, and some only have a standard price
		// If the selected gas price (such as 'fast') is not available on the current
		// network, switch to standard.
		if (!this.gasPrices[this.store.uiState.gasPrice]) this.store.uiState.gasPrice = 'standard';
	});

	setProvider = action((provider: any) => {
		this.provider = provider;
		this.getCurrentBlock();
	});

	setAddress = action(
		async (address: string): Promise<void> => {
			if (this.checkSupportedNetwork()) {
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

	// Check to see if the wallet's connected network matches the currently defined network
	// if it doesn't, set to the proper network
	checkNetwork = action((network: number): boolean => {
		// M50: Some onboard wallets don't have providers, we mock in the app network to fill in the gap here
		const walletState = this.onboard.getState();
		const walletName = walletState.wallet.name;
		if (!walletName) return false;
		// If this returns undefined, the network is not supported.
		const connectedNetwork = getNetworkNameFromId(isRpcWallet(walletName) ? walletState.appNetworkId : network);

		if (!connectedNetwork) {
			this.store.uiState.queueNotification('Connecting to an unsupported network', 'error');
			return false;
		}
		const newNetwork = getNetwork(connectedNetwork);
		if (newNetwork.networkId !== this.network.networkId) {
			this.network = newNetwork;
			this.store.walletRefresh();
			this.getGasPrice();
			this.getCurrentBlock();
		}
		return true;
	});

	setNetwork = action((network: string): void => {
		// only allow toggling if no wallet is connected
		if (this.connectedAddress) {
			return;
		}
		this.network = getNetwork(network);
		this.store.walletRefresh();
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
