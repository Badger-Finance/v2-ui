import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';

import BigNumber from 'bignumber.js';
import { onboardWalletCheck, getOnboardWallets } from '../../config/wallets';
import { getNetwork, getNetworkNameFromId } from '../../mobx/utils/web3';
import _ from 'lodash';
import { Network } from 'mobx/model';
import { RootStore } from 'mobx/store';
import { NETWORK_LIST } from 'config/constants';

class WalletStore {
	private store: RootStore;
	public onboard: any;
	public notify: any;
	public provider?: any = null;
	public connectedAddress = '';
	public currentBlock?: number;
	public ethBalance?: BigNumber;
	public gasPrices: { [index: string]: number };
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

		const notifyOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: this.network.networkId,
		};

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: { slow: 51, standard: 75, rapid: 122 },
			ethBalance: new BigNumber(0),
			network: this.network,
			onboard: Onboard(onboardOptions),
			notify: Notify(notifyOptions),
		});

		this.init();
	}

	init = action(
		async (): Promise<void> => {
			this.getCurrentBlock();
			this.getGasPrice();

			setInterval(() => {
				this.getGasPrice();
			}, 13000);
			setInterval(() => {
				this.getCurrentBlock();
			}, 5000 * 60);

			const previouslySelectedWallet = window.localStorage.getItem('selectedWallet');

			// call wallet select with that value if it exists
			if (!!previouslySelectedWallet) {
				this.onboard.walletSelect(previouslySelectedWallet);
			}
			this.notify.config({
				darkMode: true, // (default: false)
			});
		},
	);

	walletReset = action(() => {
		try {
			this.setProvider(null);
			this.setAddress('');
			window.localStorage.removeItem('selectedWallet');
		} catch (err) {
			console.log(err);
		}
	});

	connect = action((wsOnboard: any) => {
		const walletState = wsOnboard.getState();
		this.checkNetwork(walletState.network);
		this.getGasPrice();
		this.setProvider(walletState.wallet.provider);
		this.connectedAddress = walletState.address;
		this.onboard = wsOnboard;
	});

	getCurrentBlock = action(() => {
		if (!this.provider) {
			return;
		}
		const web3 = new Web3(this.provider);
		web3.eth.getBlockNumber().then((value: number) => {
			this.currentBlock = value - 50;
		});
		this.getEthBalance();
	});

	getEthBalance = action(() => {
		const web3 = new Web3(this.provider);
		!!this.connectedAddress &&
			web3.eth.getBalance(this.connectedAddress).then((value: string) => {
				this.ethBalance = new BigNumber(value);
			});
	});

	getGasPrice = action(() => {
		this.network.getGasPrices().then((price: any) => {
			this.gasPrices = price;
		});
	});

	setProvider = action((provider: any) => {
		this.provider = provider;
		this.getCurrentBlock();
	});

	setAddress = action((address: any) => {
		this.connectedAddress = address;
		this.getCurrentBlock();
	});

	cacheWallet = action((wallet: any) => {
		this.setProvider(wallet.provider);
		window.localStorage.setItem('selectedWallet', wallet.name);
	});

	checkNetwork = action((network: number) => {
		// Check to see if the wallet's connected network matches the currently defined network
		// if it doesn't, set to the proper network
		if (network !== this.network.networkId) {
			this.network = getNetwork(getNetworkNameFromId(network));
			this.store.walletRefresh();
			this.getGasPrice();
			this.getCurrentBlock();
		}
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
}

export default WalletStore;
