import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import Onboard from 'bnc-onboard';

import { RootStore } from '../store';
import BigNumber from 'bignumber.js';
import { onboardWallets, onboardWalletCheck } from '../../config/wallets';
import _ from 'lodash';
import { RPC_URL } from 'config/constants';

class WalletStore {
	private store?: RootStore;

	public onboard: any;
	public provider?: any = new Web3.providers.HttpProvider(RPC_URL);
	public connectedAddress = '';
	public currentBlock?: number;
	public ethBalance?: BigNumber;
	public gasPrices?: any;

	constructor(store: RootStore) {
		this.store = store;

		const onboardOptions: any = {
			dappId: 'af74a87b-cd08-4f45-83ff-ade6b3859a07',
			networkId: 1,
			darkMode: true,
			subscriptions: {
				address: this.setAddress,
				wallet: this.cacheWallet,
			},
			walletSelect: {
				heading: 'Connect to BadgerDAO',
				description: 'Deposit & Earn on your Bitcoin',
				wallets: onboardWallets,
			},
			walletCheck: onboardWalletCheck,
		};

		extendObservable(this, {
			connectedAddress: this.connectedAddress,
			provider: this.provider,
			currentBlock: undefined,
			gasPrices: { slow: 51, standard: 75, rapid: 122 },
			ethBalance: new BigNumber(0),
			onboard: Onboard(onboardOptions),
		});

		this.getCurrentBlock();
		this.getGasPrice();

		setInterval(() => {
			this.getGasPrice();
			// this.getCurrentBlock()
		}, 13000);
		setInterval(() => {
			// this.getGasPrice()
			this.getCurrentBlock();
		}, 5000 * 60);

		const previouslySelectedWallet = window.localStorage.getItem('selectedWallet');

		// call wallet select with that value if it exists
		if (!!previouslySelectedWallet) {
			this.onboard.walletSelect(previouslySelectedWallet);
		}
	}

	walletReset = action(() => {
		try {
			this.setProvider(new Web3.providers.HttpProvider(RPC_URL));
			this.setAddress('');
			window.localStorage.removeItem('selectedWallet');
		} catch (err) {
			console.log(err);
		}
	});

	connect = action((wsOnboard: any) => {
		const walletState = wsOnboard.getState();
		this.setProvider(walletState.wallet.provider);
		this.connectedAddress = walletState.address;
		this.onboard = wsOnboard;
	});

	getCurrentBlock = action(() => {
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
		fetch('https://www.gasnow.org/api/v3/gas/price?utm_source=badgerv2')
			.then((result: any) => result.json())
			.then((price: any) => {
				this.gasPrices = _.mapValues(price.data, (val: number) => val / 1e9);
			});
	});

	setProvider = action((provider: any) => {
		this.provider = provider;
		this.getCurrentBlock();
	});

	setAddress = action((address: any) => {
		this.connectedAddress = address;
	});
	cacheWallet = action((wallet: any) => {
		this.setProvider(wallet.provider);
		window.localStorage.setItem('selectedWallet', wallet.name);
	});
	isCached = action(() => {
		return !!this.connectedAddress || !!window.localStorage.getItem('selectedWallet');
	});
}

export default WalletStore;
