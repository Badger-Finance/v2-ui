import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../RootStore';
import WalletStore from 'mobx/stores/walletStore';
import { Currency } from 'config/enums/currency.enum';
import { DEFAULT_CURRENCY } from 'config/constants';
import { GasSpeed } from '@badger-dao/sdk';

class UiState {
	private readonly store!: RootStore;
	public currency: Currency;
	public airdropStats: any;
	public sidebarOpen!: boolean;
	public showUserBalances: boolean;
	public notification: any = {};
	public gasPrice: GasSpeed;
	public txStatus?: string;
	private showNotification: boolean;

	constructor(store: RootStore) {
		this.store = store;
		this.showUserBalances = false;
		this.gasPrice = GasSpeed.Rapid;
		this.currency = this.loadCurrency(DEFAULT_CURRENCY);
		this.showNotification = this.notificationClosingThreshold < 3;
		const { network } = store.network;

		extendObservable(this, {
			showNotification: this.showNotification,
			currency: this.currency,
			period: window.localStorage.getItem(`${network.name}-selectedPeriod`) || 'year',
			sidebarOpen: !!window && window.innerWidth > 960,
			showUserBalances: this.showUserBalances,
			notification: {},
			gasPrice: window.localStorage.getItem(`${network.name}-selectedGasPrice`) || 'standard',
			txStatus: undefined,
		});

		observe(this.store.wallet as WalletStore, 'connectedAddress', () => {
			if (!this.store.wallet.connectedAddress) {
				this.setShowUserBalances(false);
			}
		});

		// hide the sidebar
		window.onresize = () => {
			this.sidebarOpen = window.innerWidth >= 960;
		};
	}

	get notificationClosingThreshold(): number {
		const { network } = this.store.network;
		return Number(window.localStorage.getItem(`${network.name}-closing-threshold`)) || 0;
	}

	get shouldShowNotification(): boolean {
		if (this.notificationClosingThreshold > 3) {
			return false;
		}

		return this.showNotification;
	}

	/* Load Operations */

	private loadCurrency(defaultCurrency: Currency): Currency {
		const { network } = this.store.network;
		const stored = window.localStorage.getItem(`${network.name}-selectedCurrency`);
		const currency = stored?.toUpperCase() || defaultCurrency;
		return Currency[currency as keyof typeof Currency] || defaultCurrency;
	}

	closeNotification = action(() => {
		const { network } = this.store.network;
		window.localStorage.setItem(`${network.name}-closing-threshold`, String(this.notificationClosingThreshold + 1));
		this.showNotification = false;
	});

	queueNotification = action((message: string, variant: string, hash?: string) => {
		this.notification = { message, variant, persist: false, hash: hash };
	});

	queueError(message: string): void {
		this.queueNotification(message, 'error');
	}

	// TODO: this does nothing?
	setTxStatus = action((status?: string) => {
		this.txStatus = status;
	});

	setGasPrice = action((gasPrice: GasSpeed) => {
		this.gasPrice = gasPrice;
		const { network } = this.store.network;
		window.localStorage.setItem(`${network.name}-selectedGasPrice`, gasPrice);
	});

	setShowUserBalances = action((hide: boolean) => (this.showUserBalances = hide));

	setCurrency = action((currency: Currency) => {
		this.currency = currency;
		const { network } = this.store.network;
		window.localStorage.setItem(`${network.name}-selectedCurrency`, currency);
	});

	openSidebar = action(() => {
		this.sidebarOpen = true;
	});

	closeSidebar = action(() => {
		this.sidebarOpen = window.innerWidth >= 960;
	});
}

export default UiState;
