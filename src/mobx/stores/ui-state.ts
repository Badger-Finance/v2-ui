import async from 'async';
import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { extendObservable, action, intercept, IInterceptor, IValueWillChange, observe } from 'mobx';
import { collections } from '../../config/constants';
import { RootStore } from '../store';
import { growthQuery, secondsToBlocks } from '../utils/helpers';
import { reduceGrowth } from '../utils/reducers';
const START_BLOCK = 11381216

class UiState {
	private store!: RootStore

	public errorMessage?: String;
	public collection?: any;
	public vault?: string;

	public stats?: any;

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			errorMessage: undefined,
			collection: undefined,
			vault: undefined,
			stats: {
				tvl: { eth: '...' },
				growth: { day: '...', month: '...', week: '...', year: '...' }
			}
		});

		observe(this.store.contracts as any, "tokens", (change: any) => {
			// skip first update
			if (!!change.oldValue)
				this.calculateTVL()
		})
		observe(this.store.wallet as any, "currentBlock", (change: any) => {
			this.calculateGrowth()
		})

	}

	setCollection = action((id: string) => {
		if (!!this.collection && this.collection.id === id)
			return

		this.collection = collections.find((collection) => collection.id === id)
		this.store?.contracts.fetchCollection()
	});

	setVault = action((collection: string, id: string) => {
		this.vault = id
		this.setCollection(collection)
	});

	calculateTVL = action(() => {
		let { vaults, tokens } = this.store.contracts
		console.log(vaults, tokens)
		if (!vaults || !tokens)
			return

		let tvl = new BigNumber(0)
		_.forIn(vaults, (vault: any, address: string) => {
			let inputToken = tokens[vault.token]
			tvl = tvl.plus(vault.totalSupply.dividedBy(1e18).multipliedBy(inputToken.ethValue))
		})

		this.stats.tvl = {
			eth: tvl.dividedBy(1e18).dividedBy(1e3).toFixed(1).toLocaleString() + 'k'
		}

	});

	calculateGrowth = action(() => {
		let { vaults, tokens } = this.store.contracts
		let { currentBlock } = this.store.wallet

		if (!currentBlock)
			return

		let periods = [
			Math.max(currentBlock - secondsToBlocks(60 * 5), START_BLOCK), 				// 5 minutes ago
			Math.max(currentBlock - secondsToBlocks(1 * 24 * 60 * 60), START_BLOCK), 	// day
			Math.max(currentBlock - secondsToBlocks(7 * 24 * 60 * 60), START_BLOCK),	// week
			Math.max(currentBlock - secondsToBlocks(30 * 24 * 60 * 60), START_BLOCK),	// month
			START_BLOCK, 	// start
		]

		const growthPromises = periods.map(growthQuery)

		let tvl = new BigNumber(0)

		Promise.all(growthPromises)
			.then((result: any) => {
				let vaultGrowth = reduceGrowth(result, periods)
				this.stats.growth = _.mapValues(vaultGrowth.total as any, (value: any) => value.toFixed(2) + "%")
			})

	})

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