import async from 'async';
import BigNumber from 'bignumber.js';
import _, { times } from 'lodash';
import { extendObservable, action, observe, computed } from 'mobx';
import Web3 from 'web3';
import { RootStore } from '../store';
import { growthQuery, jsonQuery, secondsToBlocks } from '../utils/helpers';
import { reduceAirdrops, reduceClaims, reduceContractsToStats, reduceRebaseToStats } from '../reducers/statsReducers';
import views from '../../config/routes';

class UiState {
	private store!: RootStore

	public currency!: string
	public period!: string

	public collection: any;
	public stats?: any;
	public claims?: any;
	public vaultStats: any
	public geyserStats: any
	public treeStats: any
	public airdropStats: any
	public rebaseStats: any

	public sidebarOpen!: boolean
	public notification: any = {}
	public gasPrice!: string

	public txStatus?: string


	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			collection: {},
			stats: {
				stats: {
					tvl: '...',
					growth: '...',
					badgerLiqGrowth: '...',
					badgerGrowth: '...',
					portfolio: '...',
					_vaultGrowth: {},

				},
				assets: {
					wallet: [],
					deposits: []
				}
			},
			claims: [0, 0, 0],
			geyserStats: {},
			vaultStats: {},
			rebaseStats: {},
			treeStats: { claims: [] },
			airdropStats: { badger: '0.00000' },

			currency: window.localStorage.getItem('selectedCurrency') || 'usd',
			period: window.localStorage.getItem('selectedPeriod') || 'year',

			sidebarOpen: !!window && window.innerWidth > 960,
			notification: {},
			gasPrice: window.localStorage.getItem('selectedGasPrice') || 'standard',
			txStatus: undefined
		});


		// format vaults and geysers to ui
		observe(this.store.contracts as any, "geysers", (change: any) => {
			if (!!change.oldValue)
				try {
					this.reduceContracts()
				} catch (e) {
					console.log(e)
				}

		})
		observe(this.store.contracts as any, "vaults", (change: any) => {
			if (!!change.oldValue)
				try {
					this.reduceContracts()
				} catch (e) {
					console.log(e)
				}
		})
		observe(this.store.contracts as any, "tokens", (change: any) => {
			if (!!change.oldValue)
				try {
					this.reduceContracts()
				} catch (e) {
					console.log(e)
				}
		})

		// format rewards for UI
		observe(this.store.contracts as any, "badgerTree", (change: any) => {
			try {
				// skip first update
				this.reduceTreeRewards()
			} catch (e) {
				console.log(e)
			}

		})
		observe(this.store.contracts as any, "airdrops", (change: any) => {

			try {
				// skip first update
				this.reduceAirdrops()
			} catch (e) {
				console.log(e)
			}
		})

		// redirect to portfolio if logged in
		// observe(this.store.wallet as any, "provider", (change: any) => {
		// 	this.store.router.goTo(views.home)
		// })

		// reduce to formatted options
		observe(this as any, "period", (change: any) => {
			try {
				this.reduceContracts()
			} catch (e) {
				console.log(e)
			}
		})
		observe(this as any, "currency", (change: any) => {
			try {
				this.reduceContracts()
			} catch (e) {
				console.log(e)
			}
		})

		// hide the sidebar
		window.onresize = () => {
			if (window.innerWidth < 960) {
				this.sidebarOpen = false
			} else {
				this.sidebarOpen = true
			}
		}
	}

	queueNotification = action((message: string, variant: string) => {
		this.notification = { message, variant, persist: false }
	})

	setTxStatus = action((status?: string) => {
		this.txStatus = status
	})

	reduceContracts = action(() => {
		let newStats = reduceContractsToStats(this.store)
		this.stats = !!newStats ? reduceContractsToStats(this.store) : this.stats
	});

	reduceTreeRewards = action(() => {
		this.treeStats = this.store.contracts.badgerTree
	});

	reduceAirdrops = action(() => {
		this.airdropStats = reduceAirdrops(this.store.contracts.airdrops.airdrops)
	});

	setCollection = action((id: string) => {
		if (!!this.collection && this.collection.id === id)
			return

	});

	setGasPrice = action((gasPrice: string) => {
		this.gasPrice = gasPrice
		window.localStorage.setItem('selectedGasPrice', gasPrice)

	});

	setCurrency = action((currency: string) => {
		this.currency = currency
		window.localStorage.setItem('selectedCurrency', currency)

	});
	setPeriod = action((period: string) => {
		this.period = period
		window.localStorage.setItem('selectedPeriod', period)

	});
	openSidebar = action(() => {
		this.sidebarOpen = true
	});
	closeSidebar = action(() => {
		if (window.innerWidth < 960) {
			this.sidebarOpen = false
		} else {
			this.sidebarOpen = true
		}
	});

}

export default UiState;


