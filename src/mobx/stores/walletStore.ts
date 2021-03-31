import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';
import BigNumber from 'bignumber.js';
import { onboardWalletCheck, getOnboardWallets } from '../../config/wallets';
import { getNetwork, getNetworkNameFromId } from '../../mobx/utils/web3';
import { GasPrices, Network } from 'mobx/model';
import { RootStore } from 'mobx/store';
import { API } from 'bnc-onboard/dist/src/interfaces';

class WalletStore {
	private store: RootStore;
	public onboard: API;
	public notify: any;
	public provider?: any | null;
	public connectedAddress = '';
	public currentBlock?: number;
	public ethBalance?: BigNumber;
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

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: { slow: 51, standard: 75, rapid: 122 },
			ethBalance: new BigNumber(0),
			network: this.network,
			onboard: onboard,
			notify: Notify(notifyOptions),
		});

		// set defaults
		this.onboard = onboard;
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
				// this.onboard
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
		this.setProvider(walletState.wallet.provider);
		this.connectedAddress = walletState.address;
		this.onboard = wsOnboard;
		this.store.walletRefresh();
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
