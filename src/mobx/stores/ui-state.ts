import async from 'async';
import BigNumber from 'bignumber.js';
import _, { times } from 'lodash';
import { extendObservable, action, observe } from 'mobx';
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
				growth: { day: '...', month: '...', week: '...', year: '...' },
				vaults: undefined,
				geysers: undefined,
				portfolio: {}
			}
		});

		observe(this.store.contracts as any, "tokens", (change: any) => {
			// skip first update
			if (!!change.oldValue) {
				this.calculateTVL()
				this.calculateGeyserRewards()
			}
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

				// save the growth
				let vaultGrowth = reduceGrowth(result, periods)
				this.stats.growth = _.mapValues(vaultGrowth.total as any, (value: any) => value.multipliedBy(100).toFixed(2) + "%")

				// extend vaults with new growth statistics.. pretty hairy maybe we keep this is the UI-state
				this.updateVaults(vaultGrowth.vaults)
			})

	})

	calculateGeyserRewards = action(() => {
		let { geysers, tokens, vaults } = this.store.contracts
		let { currentBlock } = this.store.wallet

		let { method, tokens: rewardTokens } = this.collection.configs.geysers.rewards

		if (geysers == {} || !tokens)
			return

		const rewardToken = tokens[rewardTokens[0]]
		const timestamp = new BigNumber(new Date().getTime() / 1000.0)

		this.updateGeysers(
			_.mapValues(geysers,
				(geyser: any, address: string) => {
					let schedule = geyser[method]
					const underlyingVault = vaults[geyser[this.collection.configs.geysers.underlying]]
					const underlyingToken = tokens[underlyingVault[this.collection.configs.vaults.underlying]]

					// sum rewards in current period
					let locked = new BigNumber(0)
					let period = { start: timestamp, end: timestamp }
					schedule.forEach((block: any) => {
						let [initialLocked, endAtSec, duration, startTime] = _.valuesIn(block).map((val: any) => new BigNumber(val))

						if (timestamp.gt(startTime)
							&& timestamp.lt(endAtSec)) {
							locked = locked.plus(initialLocked)
							if (startTime.lt(period.start))
								period.start = startTime
							if (endAtSec.gt(period.end))
								period.end = endAtSec
						}
					})

					const rps = locked.dividedBy(period.end.minus(period.start))

					// todo: break out to actual durations
					let rewards = {
						day: rps.multipliedBy(60 * 60 * 24),
						week: rps.multipliedBy(60 * 60 * 24 * 7),
						month: rps.multipliedBy(60 * 60 * 24 * 30),
						year: rps.multipliedBy(60 * 60 * 24 * 365),
						// ethBalance: !!geyser.totalStakedFor ? new BigNumber(geyser.totalStakedFor).multipliedBy(underlyingToken.ethValue) : new BigNumber(0)
					}

					console.log(underlyingToken, rewardToken)

					return _.mapValues(rewards, (reward: any) => {
						return reward.multipliedBy(rewardToken.ethValue)
							.dividedBy(
								underlyingToken.ethValue
									.multipliedBy(underlyingToken.totalSupply)).multipliedBy(1e2).toFixed(2) + "%"
					})
				}))


	})

	updateVaults = action((vaults: any) => {
		this.stats.vaults = !this.stats.vaults ? vaults : _.mapValues(
			this.stats.vaults,
			(value: any, address: string) =>
				_.assign(
					value,
					vaults[address]))

	});
	updateGeysers = action((geysers: any) => {
		this.stats.geysers = !this.stats.geysers ? geysers : _.mapValues(
			this.stats.geysers,
			(value: any, address: string) =>
				_.assign(
					value,
					geysers[address]))

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