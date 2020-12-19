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
				growth: { day: '...', month: '...', week: '...', year: '...' }
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
		let { vaults, tokens, updateVaults } = this.store.contracts
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
				updateVaults(
					_.mapValues(
						vaultGrowth.vaults as any,
						(value: any) =>
							_.mapValues(
								value,
								(number: BigNumber) =>
									number.multipliedBy(100).toFixed(2) + "%")))


			})

	})

	calculateGeyserRewards = action(() => {
		let { geysers, tokens, vaults, updateGeysers } = this.store.contracts
		let { currentBlock } = this.store.wallet

		let { method, tokens: rewardTokens } = this.collection.configs.geysers.rewards

		if (geysers == {} || !tokens)
			return

		const rewardToken = tokens[rewardTokens[0]]
		const timestamp = new BigNumber(new Date().getTime() / 1000.0)

		updateGeysers(
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
						year: rps.multipliedBy(60 * 60 * 24 * 365)
					}

					console.log(underlyingToken, rewardToken)

					return _.mapValues(rewards, (reward: any) => {
						return reward.multipliedBy(rewardToken.ethValue)
							.dividedBy(
								underlyingToken.ethValue
									.multipliedBy(underlyingToken.totalSupply)).multipliedBy(1e2).toFixed(2) + "%"
					})
				}))

		// if (!currentBlock)
		// 	return

		// 	let schedule = await earn.methods.getUnlockSchedulesFor(deploy.token).call();
		// 	if (!!schedule.length > 0) {


		// 		let initialLocked = 0
		// 		let endTime = 0
		// 		let startTime = 0

		// 		schedule.forEach((s) => {
		// 			console.log(s)

		// 			if (new Date() > new Date(parseInt(s.startTime) * 1000)
		// 				&& new Date() < new Date(parseInt(s.endAtSec) * 1000)) {
		// 				initialLocked += parseInt(s.initialLocked)


		// 				if (startTime == 0 || parseInt(s.startTime) < startTime)
		// 					startTime = parseInt(s.startTime)
		// 				if (endTime === 0 || parseInt(s.endAtSec) > endTime)
		// 					endTime = parseInt(s.endAtSec)

		// 			}
		// 			// console.log(startTime, endTime, initialLocked, new Date(parseInt(s.startTime) * 1000), new Date(parseInt(s.endAtSec) * 1000))

		// 		})
		// 		let durationSec = endTime - startTime
		// 		// console.log(durationSec)
		// 		if (durationSec == 0) {
		// 			initialLocked = parseInt(schedule[0]["initialLocked"])
		// 			durationSec = parseInt(schedule[0]["durationSec"])
		// 		}



		// 		let badgerPrice = parseFloat(usdPrices['badger'].eth)
		// 		let tokenPrice = parseFloat(usdPrices[asset.price_id].eth)

		// 		let totalRewards = parseFloat(initialLocked / 1e18)

		// 		let badgerPerTokenPerYear = ((totalRewards / durationSec)) / (asset.vaultHoldings) * (60 * 60 * 24 * 365)
		// 		let apy = ((badgerPerTokenPerYear * badgerPrice)) / (tokenPrice)

		// 		if (asset.id == "bBadgerwbtc") {
		// 			// console.log(badgerPerTokenPerYear = ((totalRewards / durationSec)), (asset.vaultValue), (60 * 60 * 24 * 365))
		// 			badgerPerTokenPerYear = ((totalRewards / durationSec)) * (60 * 60 * 24 * 365)
		// 			apy = (badgerPerTokenPerYear * badgerPrice) / asset.vaultValue
		// 		}


		// 		apy = apy === Infinity ? 0 : apy

		// 		callback(null, { rewards: totalRewards, apy: apy })
		// 	} else {

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