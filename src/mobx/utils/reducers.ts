import BigNumber from "bignumber.js";
import _ from "lodash";
import { RootStore } from "../store";
import UiState from "../stores/ui-state";
import { inCurrency } from "./helpers";


export const reduceBatchResult = (result: any[]): any[] => {
	return result.map((vault) => {
		return _.mapValues(vault, (element: any, name: string) =>
			Array.isArray(element) ?
				reduceResult(element[0].value) :
				reduceResult(element));

	})
}

export const reduceResult = (value: any): any => {
	if (/^-?\d+$/.test(value))
		return new BigNumber(value)

	else if (_.isString(value) && value.slice(0, 2) === '0x')
		return (value as string).toLowerCase()

	else if (_.isString(value))
		return value

	else
		return value
}

export const reduceGraphResult = (graphResult: any[]) => {

	return graphResult.map((element: any) => {
		if (!element.data.pair && !element.data.token)
			return

		let ethValue = !!element.data.pair ? new BigNumber(element.data.pair.reserveETH).dividedBy(new BigNumber(element.data.pair.totalSupply)).multipliedBy(1e18) : new BigNumber(element.data.token.derivedETH).multipliedBy(1e18)
		let tokenAddress = !!element.data.pair ? element.data.pair.id : element.data.token.id

		return {
			address: tokenAddress,
			type: !!element.data.pair ? 'pair' : 'token',
			symbol: !!element.data.pair ? element.data.pair.token0.symbol + '/' + element.data.pair.token1.symbol : element.data.token.symbol,
			name: !!element.data.pair ? element.data.pair.token0.name + '/' + element.data.pair.token1.name : element.data.token.name,
			ethValue: ethValue
		}
	})
}


export const reduceCurveResult = (graphResult: any[], contracts: any[], tokenContracts: any, wbtcToken: any) => {
	return graphResult.map((result: any, i: number) => {

		return {
			address: contracts[i],
			virtualPrice: new BigNumber(result[0].virtual_price),
			ethValue: new BigNumber(result[0].virtual_price).multipliedBy(wbtcToken.ethValue).dividedBy(1e18),
			totalSupply: tokenContracts[contracts[i]].totalSupply
		}
	})
}

export const reduceGrowth = (graphResult: any[], periods: number[]) => {
	let reduction = graphResult
		.map((result: any, i: number) =>
			_.keyBy(result.data.vaults, 'id'))

	let vaults = _.mapValues(reduction[0], (value: any, key: string) => {
		let timePeriods = ["now", "day", "week", "month", "start"]

		let growth: any = {}
		reduction.forEach((vault: any, i: number) =>
			growth[timePeriods[i]] = !!vault[key] ?
				new BigNumber(vault[key].pricePerFullShare)
				: new BigNumber("1")
		)
		return {
			day: growth.now.dividedBy(growth.day).minus(1),
			week: growth.now.dividedBy(growth.week).minus(1),
			month: growth.now.dividedBy(growth.month).minus(1),
			year: growth.now.dividedBy(growth.month).minus(1).multipliedBy(12.0),
		}
	})

	return {
		vaults
	}

}

export const reduceGeyserSchedule = (timestamp: BigNumber, schedule: any) => {
	let locked = new BigNumber(0);
	let period = { start: timestamp, end: timestamp };
	schedule.forEach((block: any) => {
		let [initialLocked, endAtSec, duration, startTime] = _.valuesIn(block).map((val: any) => new BigNumber(val));

		if (timestamp.gt(startTime)
			&& timestamp.lt(endAtSec)) {
			locked = locked.plus(initialLocked);
			if (startTime.lt(period.start))
				period.start = startTime;
			if (endAtSec.gt(period.end))
				period.end = endAtSec;
		}
	});
	let badgerPerSecond = locked.dividedBy(period.end.minus(period.start))

	return {
		day: badgerPerSecond.multipliedBy(60 * 60 * 24),
		week: badgerPerSecond.multipliedBy(60 * 60 * 24 * 7),
		month: badgerPerSecond.multipliedBy(60 * 60 * 24 * 30),
		year: badgerPerSecond.multipliedBy(60 * 60 * 24 * 365),
		// ethBalance: !!geyser.totalStakedFor ? new BigNumber(geyser.totalStakedFor).multipliedBy(underlyingToken.ethValue) : new BigNumber(0)
	}

}

export const reduceGeysersToStats = (store: RootStore) => {
	const { vaults, geysers, tokens } = store.contracts
	const { collection, stats, period, currency } = store.uiState

	const config = collection.configs.geysers

	return _.mapValues(geysers, (geyser: any, geyserAddress: string) => {

		let vault = vaults[geyser[config.underlying]]
		let token = tokens[vault.token]
		let vaultToken = tokens[vault.address]

		// return geyser
		let virtualEthValue = !!token.ethValue ? token.ethValue.dividedBy(1e18).multipliedBy(!!vault.getPricePerFullShare ? vault.getPricePerFullShare.dividedBy(1e18) : 1) : token.ethValue

		return {
			address: geyser.address,
			vault,
			geyser,

			underlyingTokens: !!geyser.totalStaked &&
				inCurrency(geyser.totalStaked, 'eth', true),
			underlyingBalance: !!geyser.totalStaked &&
				inCurrency(geyser.totalStaked.multipliedBy(virtualEthValue), currency),


			yourValue: !!geyser.totalStakedFor &&
				inCurrency(geyser.totalStakedFor.multipliedBy(virtualEthValue), currency),
			yourBalance: !!geyser.totalStakedFor &&
				inCurrency(geyser.totalStakedFor, 'eth', true),

			availableBalance: !!token.balanceOf &&
				inCurrency(token.balanceOf, 'eth', true),

			depositedFull: !!geyser.totalStakedFor && {
				25: inCurrency(geyser.totalStakedFor.multipliedBy(0.25), 'eth', true, 18),
				50: inCurrency(geyser.totalStakedFor.multipliedBy(0.5), 'eth', true, 18),
				75: inCurrency(geyser.totalStakedFor.multipliedBy(0.75), 'eth', true, 18),
				100: inCurrency(geyser.totalStakedFor, 'eth', true, 18),
			},

			name: token.name,
			symbol: token.symbol,
			vaultGrowth: !!vault[period] && vault[period].multipliedBy(1e2).toFixed(2) + "%",
			geyserGrowth: !!geyser[period] && geyser[period].multipliedBy(1e2).toFixed(2) + "%",
			growth: !!vault[period] && vault[period].plus(geyser[period] || 0).multipliedBy(1e2).toFixed(2) + "%",
		}
	})
}
export const reduceClaims = (merkleProof: any, claimedRewards: any[]) => {
	return merkleProof.cumulativeAmounts.map((amount: number, i: number) => {
		return inCurrency(new BigNumber(amount).minus(claimedRewards[1][i]), 'eth', true);
	});
}




export const reduceVaultsToStats = (store: RootStore) => {
	const { vaults, geysers, tokens } = store.contracts
	const { collection, stats, currency, period } = store.uiState

	const config = collection.configs.geysers

	return _.mapValues(vaults, (vault: any, vaultAddress: string) => {

		let token = tokens[vault.token]
		let wrapped = tokens[vault.address]
		let geyser = geysers[wrapped.contract]

		return {
			vault: vault,
			address: vault.address,

			yourBalance: !!vault.balanceOf &&
				inCurrency(vault.balanceOf.plus(token.balanceOf), 'eth', true),
			yourValue: !!vault.balanceOf && !!token.ethValue &&
				inCurrency(vault.balanceOf.plus(token.balanceOf).multipliedBy(token.ethValue.dividedBy(1e18)), currency),

			anyWrapped: !!vault.balanceOf && vault.balanceOf.gt(0),

			underlyingTokens: !!vault.totalSupply &&
				inCurrency(vault.totalSupply, 'eth', true),
			underlyingBalance: !!vault.totalSupply && !!token.ethValue &&
				inCurrency(vault.totalSupply.multipliedBy(token.ethValue.dividedBy(1e18)), currency),

			availableBalance: !!token.balanceOf &&
				inCurrency(token.balanceOf.plus(vault.balanceOf), 'eth', true),

			availableFull: !!token.balanceOf && {
				25: inCurrency(token.balanceOf.plus(vault.balanceOf).multipliedBy(0.25), 'eth', true, 18),
				50: inCurrency(token.balanceOf.plus(vault.balanceOf).multipliedBy(0.5), 'eth', true, 18),
				75: inCurrency(token.balanceOf.plus(vault.balanceOf).multipliedBy(0.75), 'eth', true, 18),
				100: inCurrency(token.balanceOf.plus(vault.balanceOf), 'eth', true, 18),
			},
			wrappedFull: !!wrapped.balanceOf && {
				25: inCurrency(wrapped.balanceOf.multipliedBy(0.25), 'eth', true, 18),
				50: inCurrency(wrapped.balanceOf.multipliedBy(0.5), 'eth', true, 18),
				75: inCurrency(wrapped.balanceOf.multipliedBy(0.75), 'eth', true, 18),
				100: inCurrency(wrapped.balanceOf, 'eth', true, 18),
			},

			depositedFull: !!geyser.totalStakedFor && {
				25: inCurrency(geyser.totalStakedFor.multipliedBy(0.25), 'eth', true, 18),
				50: inCurrency(geyser.totalStakedFor.multipliedBy(0.5), 'eth', true, 18),
				75: inCurrency(geyser.totalStakedFor.multipliedBy(0.75), 'eth', true, 18),
				100: inCurrency(geyser.totalStakedFor, 'eth', true, 18),
			},

			symbol: token.symbol,
			name: token.name,
			vaultGrowth: !!vault[period] && vault[period].multipliedBy(1e2).toFixed(2) + "%",
			geyserGrowth: !!geyser[period] && geyser[period].multipliedBy(1e2).toFixed(2) + "%",
			growth: !!vault[period] && vault[period].plus(geyser[period] || 0).multipliedBy(1e2).toFixed(2) + "%",

			year: !!vault['year'] && vault['year'].plus(geyser['year'] || 0).multipliedBy(1e2).toFixed(2) + "%",
			month: !!vault['month'] && vault['month'].plus(geyser['month'] || 0).multipliedBy(1e2).toFixed(2) + "%",
			day: !!vault['day'] && vault['day'].plus(geyser['day'] || 0).multipliedBy(1e2).toFixed(2) + "%",
		}
	})
}


export const reduceContractsToStats = (store: RootStore) => {
	let { vaults: vaultContracts, tokens, geysers: geyserContracts } = store.contracts
	let { configs } = store.uiState.collection
	let { currency } = store.uiState

	let tvl = new BigNumber(0)
	let wallet = new BigNumber(0)
	let geysers = new BigNumber(0)
	let portfolio = new BigNumber(0)
	let growth = new BigNumber(0)
	_.forIn(vaultContracts, (vault: any, address: string) => {
		let token = tokens[vault.token]
		let wrapped = tokens[vault.address]

		tvl = tvl.plus(vault.totalSupply.dividedBy(1e18).multipliedBy(token.ethValue))

		let value = vault.totalSupply.dividedBy(1e18).multipliedBy(token.ethValue)

		if (!!vault.year)
			growth = growth.plus(value.multipliedBy(vault.year))

		if (!!wrapped.balanceOf) {
			wallet = wallet.plus(
				wrapped.balanceOf.multipliedBy(token.ethValue).multipliedBy(vault.getPricePerFullShare.dividedBy(1e18))
					.dividedBy(1e18))

			portfolio = portfolio.plus(
				wrapped.balanceOf.multipliedBy(token.ethValue).multipliedBy(vault.getPricePerFullShare.dividedBy(1e18))
					.dividedBy(1e18))
		}

		if (!!token.balanceOf) {
			wallet = wallet.plus(token.balanceOf.multipliedBy(token.ethValue).dividedBy(1e18))
			portfolio = portfolio.plus(token.balanceOf.multipliedBy(token.ethValue).dividedBy(1e18))
		}

	})

	_.forIn(geyserContracts, (geyser: any, address: string) => {
		let vault = vaultContracts[geyser[configs.geysers.underlying]]
		let token = tokens[vault.token]

		if (!!geyser.totalStakedFor) {
			let virtualEthValue = !!token.ethValue ? token.ethValue.dividedBy(1e18).multipliedBy(vault.getPricePerFullShare.dividedBy(1e18)) : token.ethValue
			portfolio = portfolio.plus(geyser.totalStakedFor.multipliedBy(virtualEthValue))
			geysers = geysers.plus(geyser.totalStakedFor.multipliedBy(virtualEthValue))
		}
	})

	const badgerToken = !!tokens && tokens["0x3472a5a71965499acd81997a54bba8d852c6e53d"].ethValue


	return {
		tvl: inCurrency(tvl, currency),
		portfolio: inCurrency(portfolio, currency),
		growth: inCurrency(growth, currency),
		wallet: inCurrency(wallet, currency),
		geysers: inCurrency(geysers, currency),
		badger: !!tokens && inCurrency(badgerToken, currency)

	}

}


interface Currency {
	eth?: BigNumber,
	btc?: BigNumber,
	usd?: BigNumber
}