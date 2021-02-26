import { extendObservable, action, observe } from 'mobx';

import { RootStore } from '../store';

import { reduceAirdrops, reduceContractsToStats, reduceRebase } from './statsReducers';
import { digg_system } from 'config/deployments/mainnet.json';
import { WBTC_ADDRESS } from 'config/constants';
import BigNumber from 'bignumber.js';
import views from 'config/routes';

class UiState {
	private readonly store!: RootStore;

	public currency!: string;
	public period!: string;

	/**
	 * TODO: Add types.
	 */
	public collection: any;
	public stats?: any;
	public claims?: any;
	public vaultStats: any;
	public geyserStats: any;
	public treeStats: any;
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

			treeStats: { claims: [] },
			airdropStats: {},

			currency: window.localStorage.getItem('selectedCurrency') || 'usd',
			period: window.localStorage.getItem('selectedPeriod') || 'year',

			sidebarOpen: !!window && window.innerWidth > 960,
			hideZeroBal: !!window.localStorage.getItem('hideZeroBal'),
			notification: {},
			gasPrice: window.localStorage.getItem('selectedGasPrice') || 'standard',
			txStatus: undefined,
		});

		// TODO: refactor this - causes a refresh every 1s
		// format vaults and geysers to ui
		setInterval(() => {
			this.reduceStats();
			this.reduceRebase();
			this.reduceAirdrops();
			this.reduceTreeRewards();
		}, 1000);

		observe(this.store.wallet as any, 'connectedAddress', () => {
			if (!this.store.wallet.connectedAddress) this.setHideZeroBal(false);
		});

		// hide the sidebar
		window.onresize = () => {
			this.sidebarOpen = window.innerWidth >= 960;
		};
	}

	queueNotification = action((message: string, variant: string, hash: any = false) => {
		this.notification = { message, variant, persist: false, hash: hash };
	});

	setTxStatus = action((status?: string) => {
		this.txStatus = status;
	});

	reduceStats = action(() => {
		const newStats = reduceContractsToStats(this.store);
		this.stats = !!newStats ? reduceContractsToStats(this.store) : this.stats;
	});

	reduceTreeRewards = action(() => {
		this.treeStats = this.store.rewards.badgerTree;
	});

	reduceAirdrops = action(() => {
		this.airdropStats = reduceAirdrops(this.store.airdrops.airdrops, this.store);
	});

	reduceRebase = action(() => {
		const { tokens } = this.store.contracts;
		if (!!this.store.rebase.rebase && !!tokens[WBTC_ADDRESS])
			this.rebaseStats = reduceRebase(
				this.store.rebase.rebase,
				tokens[WBTC_ADDRESS],
				tokens[digg_system.uFragments],
			);
	});

	setGasPrice = action((gasPrice: string) => {
		this.gasPrice = gasPrice;
		window.localStorage.setItem('selectedGasPrice', gasPrice);
	});
	setHideZeroBal = action((hide: boolean) => {
		this.hideZeroBal = hide;
		if (hide) window.localStorage.setItem('hideZeroBal', 'YES');
		else window.localStorage.removeItem('hideZeroBal');
	});

	setCurrency = action((currency: string) => {
		this.currency = currency;
		window.localStorage.setItem('selectedCurrency', currency);
	});
	setPeriod = action((period: string) => {
		this.period = period;
		window.localStorage.setItem('selectedPeriod', period);
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
