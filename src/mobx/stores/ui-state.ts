import async from 'async';
import BigNumber from 'bignumber.js';
import _, { times } from 'lodash';
import { extendObservable, action, observe, computed } from 'mobx';
import { collections } from '../../config/constants';
import { RootStore } from '../store';
import { growthQuery, secondsToBlocks } from '../utils/helpers';
import { reduceContractsToStats, reduceGeysersToStats, reduceVaultsToStats } from '../utils/reducers';

class UiState {
	private store!: RootStore

	public currency!: string
	public period!: string

	public errorMessage?: String;
	public collection?: any;
	public vault?: string;

	public stats?: any;
	public vaultStats: any
	public geyserStats: any


	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			errorMessage: undefined,
			collection: undefined,
			vault: undefined,
			stats: {
				tvl: '...',
				growth: '...',
				portfolio: '...',
				_vaultGrowth: {}
			},
			geyserStats: {},
			vaultStats: {},
			currency: 'eth',
			period: 'year'
		});

		observe(this.store.contracts as any, "geysers", (change: any) => {
			// skip first update
			if (!!change.oldValue) {
				this.reduceContracts()
			}
		})
		observe(this.store.contracts as any, "vaults", (change: any) => {
			// skip first update
			if (!!change.oldValue) {
				this.reduceContracts()
			}
		})
		observe(this.store.wallet as any, "currentBlock", (change: any) => {
			this.reduceContracts()
		})
		observe(this as any, "period", (change: any) => {
			this.reduceContracts()
		})
		observe(this as any, "currency", (change: any) => {
			this.reduceContracts()
		})
	}


	reduceContracts = action(() => {

		this.geyserStats = reduceGeysersToStats(this.store)
		this.vaultStats = reduceVaultsToStats(this.store)

		this.stats = {
			...this.stats,
			...reduceContractsToStats(this.store)
		}

	});
	setCollection = action((id: string) => {
		if (!!this.collection && this.collection.id === id)
			return

		this.collection = collections.find((collection) => collection.id === id)
		this.store?.contracts.fetchCollection() //TODO:observe ui from collections
	});

	setVault = action((collection: string, id: string) => {
		this.vault = id
		this.setCollection(collection)
	});

	setCurrency = action((currency: string) => {
		this.currency = currency
	});
	setPeriod = action((period: string) => {
		this.period = period
	});



	// UI
	// addFilter = action((filter: string) => {
	// 	this.collection.config.config.table.push(filter)
	// });
	// removeFilter = action((filter: string) => {
	// 	this.collection.config.config.table = this.collection.config.config.table.filter((item: string) => item != filter)
	// });
	// addAction = action((method: string) => {
	// 	this.collection.config.config.actions.push(method)
	// });
	// removeAction = action((method: string) => {
	// 	this.collection.config.config.actions = this.collection.config.config.actions.filter((item: string) => item != method)
	// });

}

export default UiState;

