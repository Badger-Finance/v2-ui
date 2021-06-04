import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../store';
import BigNumber from 'bignumber.js';
import views from 'config/routes';
import WalletStore from 'mobx/stores/walletStore';

/**
 * TODO: save this class' poor soul
 */
class UiState {
	private readonly store!: RootStore;

	public currency!: string;
	public period!: string;

	/**
	 * TODO: Add types. soon. :(
	 */
	public collection: any;
	public stats?: any;
	public claims?: any;
	public vaultStats: any;
	public geyserStats: any;
	public airdropStats: any;
	public rebaseStats: any;
	public sidebarOpen!: boolean;
	public hideZeroBal!: boolean;
	public notification: any = {};
	public gasPrice!: string;

	public locked!: boolean;

	public txStatus?: string;

	constructor(store: RootStore) {
		this.store = store;
		const { network } = store.wallet;

		extendObservable(this, {
			collection: {},
			locked: window.localStorage.getItem('locked') === 'YES',
			stats: {
				stats: {
					tvl: new BigNumber(0),
					wallet: new BigNumber(0),
					deposits: new BigNumber(0),
					portfolio: undefined,
					badger: new BigNumber(0),
					digg: new BigNumber(0),
					bDigg: new BigNumber(1),
					vaultDeposits: new BigNumber(0),
				},
			},
			claims: [0, 0, 0],
			rebaseStats: {
				oraclePrice: new BigNumber(1),
				btcPrice: new BigNumber(0),
			},
			airdropStats: {},
			currency: window.localStorage.getItem(`${network.name}-selectedCurrency`) || 'usd',
			period: window.localStorage.getItem(`${network.name}-selectedPeriod`) || 'year',
			sidebarOpen: !!window && window.innerWidth > 960,
			hideZeroBal: !!window.localStorage.getItem(`${network.name}-hideZeroBal`),
			notification: {},
			gasPrice: window.localStorage.getItem(`${network.name}-selectedGasPrice`) || 'standard',
			txStatus: undefined,
		});

		observe(this.store.wallet as WalletStore, 'connectedAddress', () => {
			if (!this.store.wallet.connectedAddress) {
				this.setHideZeroBal(false);
			}
		});

		// hide the sidebar
		window.onresize = () => {
			this.sidebarOpen = window.innerWidth >= 960;
		};
	}

	queueNotification = action((message: string, variant: string, hash?: string) => {
		this.notification = { message, variant, persist: false, hash: hash };
	});

	// TODO: this does nothing?
	setTxStatus = action((status?: string) => {
		this.txStatus = status;
	});

	reduceRebase = action(() => {
		const rebaseInfo = this.store.rebase.rebase;
		const wbtc = this.store.wallet.network.deploy.tokens.wBTC;
		const wbtcPrice = this.store.setts.getPrice(wbtc);

		if (!!rebaseInfo) {
			this.rebaseStats = {
				oraclePrice: wbtcPrice.times(rebaseInfo.oracleRate),
				btcPrice: wbtcPrice,
				totalSupply: rebaseInfo.totalSupply,
				nextRebase: rebaseInfo.nextRebase,
			};
		}
	});

	setGasPrice = action((gasPrice: string) => {
		this.gasPrice = gasPrice;
		const { network } = this.store.wallet;
		window.localStorage.setItem(`${network.name}-selectedGasPrice`, gasPrice);
	});

	setHideZeroBal = action((hide: boolean) => {
		this.hideZeroBal = hide;
		const { network } = this.store.wallet;
		if (hide) window.localStorage.setItem(`${network.name}-hideZeroBal`, 'YES');
		else window.localStorage.removeItem(`${network.name}-hideZeroBal`);
	});

	setCurrency = action((currency: string) => {
		this.currency = currency;
		const { network } = this.store.wallet;
		window.localStorage.setItem(`${network.name}-selectedCurrency`, currency);
	});

	setPeriod = action((period: string) => {
		this.period = period;
		const { network } = this.store.wallet;
		window.localStorage.setItem(`${network.name}-selectedPeriod`, period);
	});

	unlockApp = action((password: string) => {
		this.locked = !(password === 'BADger');

		if (this.locked) window.localStorage.setItem('locked', 'YES');
		else window.localStorage.removeItem('locked');

		if (!this.locked) this.store.router.goTo(views.home);
	});

	openSidebar = action(() => {
		this.sidebarOpen = true;
	});

	closeSidebar = action(() => {
		this.sidebarOpen = window.innerWidth >= 960;
	});
}

export default UiState;
