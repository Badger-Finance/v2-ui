import { extendObservable, action } from 'mobx';
import { RootStore } from '../RootStore';
import { Currency } from 'config/enums/currency.enum';
import { APP_NEWS_MESSAGE, APP_NEWS_STORAGE_HASH, DEFAULT_CURRENCY } from 'config/constants';
import { GasSpeed } from '@badger-dao/sdk';
import { SnackbarNotificationProps } from '../model/ui/snackbar-notification-props';

const SHOW_USER_BALANCE_KEY = 'showUserBalance';

class UiStateStore {
	private readonly store!: RootStore;
	public currency: Currency;
	public airdropStats: any;
	public showWalletDrawer: boolean;
	public rewardsDialogOpen: boolean;
	public sidebarOpen!: boolean;
	public showUserBalances: boolean;
	public notification?: SnackbarNotificationProps;
	public gasPrice: GasSpeed;
	public txStatus?: string;
	private showNotification: boolean;
	private showNetworkOptions: boolean;

	constructor(store: RootStore) {
		this.store = store;
		const storedBalanceDisplay = window.localStorage.getItem(SHOW_USER_BALANCE_KEY);
		this.showUserBalances = storedBalanceDisplay === 'true';
		this.gasPrice = GasSpeed.Rapid;
		this.currency = this.loadCurrency(DEFAULT_CURRENCY);
		this.showNotification = this.notificationClosingThreshold < 3;
		this.showWalletDrawer = false;
		this.showNetworkOptions = false;
		this.rewardsDialogOpen = false;
		const { network } = store.network;

		extendObservable(this, {
			showNotification: this.showNotification,
			currency: this.currency,
			sidebarOpen: false,
			rewardsDialogOpen: false,
			showUserBalances: this.showUserBalances,
			notification: {},
			gasPrice: window.localStorage.getItem(`${network.name}-selectedGasPrice`) || 'standard',
			txStatus: undefined,
			showWalletDrawer: this.showWalletDrawer,
			showNetworkOptions: this.showNetworkOptions,
		});

		if (APP_NEWS_STORAGE_HASH) {
			window.localStorage.setItem(APP_NEWS_STORAGE_HASH, String(this.notificationClosingThreshold + 1));
		}
	}

	get areNetworkOptionsOpen() {
		return this.showNetworkOptions;
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
			this.showNotification = false;
		}
	});

	queueNotification = action((message: string, variant: SnackbarNotificationProps['variant'], hash?: string) => {
		this.notification = { message, variant, hash: hash };
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

	openNetworkOptions = action(() => {
		this.showNetworkOptions = true;
	});

	closeNetworkOptions = action(() => {
		this.showNetworkOptions = false;
	});

	toggleWalletDrawer = action(() => {
		this.showWalletDrawer = !this.showWalletDrawer;
	});

	openRewardsDialog = action(() => {
		this.rewardsDialogOpen = true;
	});

	toggleRewardsDialog = action(() => {
		this.rewardsDialogOpen = !this.rewardsDialogOpen;
	});
}

export default UiStateStore;
