import { action, extendObservable } from 'mobx';
import { RootStore } from '../RootStore';
import { Currency } from 'config/enums/currency.enum';
import { APP_NEWS_MESSAGE, APP_NEWS_STORAGE_HASH, DEFAULT_CURRENCY } from 'config/constants';
import { GasSpeed } from '@badger-dao/sdk';

const SHOW_USER_BALANCE_KEY = 'showUserBalance';

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
		const storedBalanceDisplay = window.localStorage.getItem(SHOW_USER_BALANCE_KEY);
		this.showUserBalances = storedBalanceDisplay === 'true';
		this.gasPrice = GasSpeed.Rapid;
		this.currency = this.loadCurrency(DEFAULT_CURRENCY);
		this.showNotification = this.notificationClosingThreshold < 3;

		const { network } = store.network;

		extendObservable(this, {
			showNotification: this.showNotification,
			currency: this.currency,
			sidebarOpen: false,
			showUserBalances: this.showUserBalances,
			notification: {},
			gasPrice: window.localStorage.getItem(`${network.name}-selectedGasPrice`) || 'standard',
			txStatus: undefined,
		});

		if (APP_NEWS_STORAGE_HASH) {
			window.localStorage.setItem(APP_NEWS_STORAGE_HASH, String(this.notificationClosingThreshold + 1));
		}
	}

	get notificationClosingThreshold(): number {
		return APP_NEWS_STORAGE_HASH ? Number(window.localStorage.getItem(APP_NEWS_STORAGE_HASH)) : 0;
	}

	get shouldShowNotification(): boolean {
		if (!APP_NEWS_MESSAGE || this.notificationClosingThreshold > 3) {
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
		if (APP_NEWS_STORAGE_HASH) {
			window.localStorage.setItem(APP_NEWS_STORAGE_HASH, String(this.notificationClosingThreshold + 1));
			this.showNotification = false;
		}
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

	setShowUserBalances = action((shouldShowUserBalance: boolean) => {
		window.localStorage.setItem(SHOW_USER_BALANCE_KEY, `${shouldShowUserBalance}`);
		this.showUserBalances = shouldShowUserBalance;
	});

	setCurrency = action((currency: Currency) => {
		this.currency = currency;
		const { network } = this.store.network;
		window.localStorage.setItem(`${network.name}-selectedCurrency`, currency);
	});

	openSidebar = action(() => {
		this.sidebarOpen = true;
	});

	closeSidebar = action(() => {
		this.sidebarOpen = false;
	});
}

export default UiState;
