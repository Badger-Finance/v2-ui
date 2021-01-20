import { extendObservable, action, observe } from 'mobx';

import { RootStore } from '../store';

import { reduceAirdrops, reduceContractsToStats, reduceRebase } from '../reducers/statsReducers';
import { WBTC_ADDRESS } from 'config/constants';
import { token as diggToken } from 'config/system/digg';

class UiState {
	private readonly store!: RootStore;

	public currency!: string;
	public period!: string;

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

	public txStatus?: string;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			collection: {},
			stats: {
				stats: {
					tvl: '...',
					growth: '...',
					wallet: '...',
					badgerLiqGrowth: '...',
					badgerGrowth: '...',
					badger: '...',
					portfolio: '...',
					_vaultGrowth: {},
				},
				assets: {
					wallet: [],
					deposits: [],
					wrapped: [],
				},
			},
			claims: [0, 0, 0],
			geyserStats: {},
			vaultStats: {},
			rebaseStats: {},
			treeStats: { claims: [] },
			airdropStats: { badger: '0.00000', digg: '0.00000' },

			currency: window.localStorage.getItem('selectedCurrency') || 'usd',
			period: window.localStorage.getItem('selectedPeriod') || 'year',

			sidebarOpen: !!window && window.innerWidth > 960,
			hideZeroBal: !!window.localStorage.getItem('hideZeroBal'),
			notification: {},
			gasPrice: window.localStorage.getItem('selectedGasPrice') || 'standard',
			txStatus: undefined,
		});

		// format vaults and geysers to ui

		observe(this.store.contracts as any, 'tokens', (change: any) => {
			if (!!change.oldValue)
				try {
					this.reduceContracts();
				} catch (e) {
					process.env.NODE_ENV !== 'production' && console.log(e);
				}
		});

		// format rewards for UI
		// observe(this.store.rewards as any, 'badgerTree', () => {
		// 	try {
		// 		// skip first update
		// 		this.reduceTreeRewards();
		// 	} catch (e) {
		// 		process.env.NODE_ENV !== 'production' && console.log(e);
		// 	}
		// });
		observe(this.store.airdrops as any, 'airdrops', () => {
			try {
				// skip first update
				this.reduceAirdrops();
			} catch (e) {
				process.env.NODE_ENV !== 'production' && console.log(e);
			}
		});

		observe(this.store.rebase as any, 'rebase', () => {
			try {
				// skip first update
				this.reduceRebase();
			} catch (e) {
				process.env.NODE_ENV !== 'production' && console.log(e);
			}
		});

		// redirect to portfolio if logged in
		// observe(this.store.wallet as any, "provider", (change: any) => {
		// 	this.store.router.goTo(views.home)
		// })

		// reduce to formatted options
		observe(this as any, 'period', () => {
			try {
				this.reduceContracts();
			} catch (e) {
				process.env.NODE_ENV !== 'production' && console.log(e);
			}
		});
		observe(this as any, 'currency', () => {
			try {
				this.reduceContracts();
			} catch (e) {
				process.env.NODE_ENV !== 'production' && console.log(e);
			}
		});
		observe(this as any, 'hideZeroBal', () => {
			try {
				this.reduceContracts();
			} catch (e) {
				process.env.NODE_ENV !== 'production' && console.log(e);
			}
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

	reduceContracts = action(() => {
		const newStats = reduceContractsToStats(this.store);
		this.stats = !!newStats ? reduceContractsToStats(this.store) : this.stats;
	});

	reduceTreeRewards = action(() => {
		this.treeStats = this.store.rewards.badgerTree;
	});

	reduceAirdrops = action(() => {
		this.airdropStats = reduceAirdrops(this.store.airdrops.airdrops);
	});

	reduceRebase = action(() => {
		const { tokens } = this.store.contracts;
		this.rebaseStats = reduceRebase(this.store.contracts.rebase, tokens[WBTC_ADDRESS], tokens[diggToken.contract]);
	});

	// setCollection = action((id: string) => {
	// 	if (!!this.collection && this.collection.id === id) return;
	// });

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
	openSidebar = action(() => {
		this.sidebarOpen = true;
	});
	closeSidebar = action(() => {
		this.sidebarOpen = window.innerWidth >= 960;
	});
}

export default UiState;
