import { match } from "assert";
import BigNumber from "bignumber.js";
import _ from "lodash";
import { ERC20, WBTC_ADDRESS } from "../../config/constants";
import { token as diggToken } from "../../config/system/digg";
import { rewards } from "../../config/system/settSystem";
import { curveTokens } from "../../config/system/tokens";
import { RootStore } from "../store";
import UiState from "../stores/uiStore";
import { inCurrency, secondsToBlocks } from "../utils/helpers";
import { batchConfig, erc20Methods } from "../utils/web3";


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

export const reduceMasterChefResults = (results: any[], contracts: string[], tokens: any, vaults: any): any => {
	let reduction = results.map((data: any, i: number) => {
		let result = data.data.masterChefs[0]

		let { totalAllocPoint, pools } = result
		let { allocPoint, slpBalance } = pools[0]

		let allocRatio = new BigNumber(parseFloat(allocPoint) / parseFloat(totalAllocPoint))

		let sushiPerBlock = new BigNumber(100).minus(new BigNumber(100).multipliedBy(allocRatio))
			.multipliedBy(3).multipliedBy(allocRatio)
		let sushiPerSecond = sushiPerBlock.multipliedBy(secondsToBlocks(1)).multipliedBy(3)

		// let apy = (derivedETH * blocksPerDay * sushiPerBlock * 365 * 3 * (onsen.allocPoint / onsen.totalAllocPoint)) / (onsen.totalValueETH * (onsen.slpBalance / onsen.totalSupply))

		return {
			address: contracts[i],
			day: sushiPerSecond.multipliedBy(60 * 60 * 24),
			week: sushiPerSecond.multipliedBy(60 * 60 * 24 * 7),
			month: sushiPerSecond.multipliedBy(60 * 60 * 24 * 30),
			year: sushiPerSecond.multipliedBy(60 * 60 * 24 * 365),
		}
	})
	return _.keyBy(reduction, 'address')

}

export const reduceGraphResult = (graphResult: any[]) => {

	let reduction = graphResult.map((element: any) => {
		if (!element.data.pair && !element.data.token)
			return

		// calculate price per token
		let ethValue = new BigNumber(0);

		if (!!element.data.pair) {
			let token0Value = new BigNumber(element.data.pair.token0.derivedETH)
			let token1Value = new BigNumber(element.data.pair.token1.derivedETH)

			// fix for sushiswap returning 0 as derivedETH value of Badger
			if (token1Value.isEqualTo(0)) {
				graphResult.forEach((result: any) => {

					if (!!result.data.token && result.data.token.id === element.data.pair.token1.id) {
						console.log('match')
						return token1Value = new BigNumber(result.data.token.derivedETH)
					}
				})
			}

			let reserve0 = new BigNumber(token0Value).multipliedBy(new BigNumber(element.data.pair.reserve0)).multipliedBy(1e18)
			let reserve1 = new BigNumber(token1Value).multipliedBy(new BigNumber(element.data.pair.reserve1)).multipliedBy(1e18)
			ethValue = reserve0.plus(reserve1).dividedBy(element.data.pair.totalSupply)
		} else {
			ethValue = new BigNumber(element.data.token.derivedETH).multipliedBy(1e18)
		}


		let tokenAddress = !!element.data.pair ? element.data.pair.id : element.data.token.id

		return {
			address: tokenAddress.toLowerCase(),
			type: !!element.data.pair ? 'pair' : 'token',
			symbol: !!element.data.pair ? element.data.pair.token0.symbol + '/' + element.data.pair.token1.symbol : element.data.token.symbol,
			name: !!element.data.pair ? element.data.pair.token0.name + '/' + element.data.pair.token1.name : element.data.token.name,
			ethValue: ethValue
		}
	})


	// average duplicates
	let noDupes = reduction.map((result: any, index: number) => {
		let token = result
		if (!!token)
			graphResult.forEach((duplicate: any, dupIndex: number) => {
				if (!!result && duplicate.address === result.address) {
					if (duplicate.ethValue.gt(0)) {
						console.log('avaraging', duplicate.ethValue, token.ethValue, token.symbol)
						token.ethValue = token.ethValue.plus(duplicate.ethValue).dividedBy(2)
					} else if (dupIndex < index) {
						token = undefined
					}
				}
			})
		return token
	})

	return _.compact(noDupes)
}


export const reduceCurveResult = (curveResult: any[], contracts: any[], tokenContracts: any, wbtcToken: any) => {
	return curveResult.map((result: any, i: number) => {

		let sum = new BigNumber(0)
		let count = 0
		result.map((sample: any, i: number) => {
			sum = sum.plus(result[0].virtual_price)
			count++
			if (i > 10)
				return
		})

		let vp = sum.dividedBy(count).dividedBy(1e18)

		return {
			address: contracts[i].toLowerCase(),
			virtualPrice: vp,
			ethValue: new BigNumber(vp).multipliedBy(wbtcToken.ethValue),
			// balance: tokenContracts[contracts[i]].balance
		}
	})
}

export const reduceGrowth = (graphResult: any[], periods: number[]) => {
	let reduction: any[] = graphResult
		.map((result: any, i: number) =>
			!!result.data && _.keyBy(result.data.vaults, 'id'))

	if (!reduction)
		return

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

	return vaults

}

export const reduceGeyserSchedule = (timestamp: BigNumber, schedule: any) => {

	let locked = new BigNumber(0);

	let period = { start: timestamp, end: timestamp };

	let lockedAllTime = new BigNumber(0);
	let periodAllTime = { start: timestamp, end: timestamp };


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

		lockedAllTime = lockedAllTime.plus(initialLocked);
		if (startTime.lt(periodAllTime.start))
			periodAllTime.start = startTime;
		if (endAtSec.gt(periodAllTime.end))
			periodAllTime.end = endAtSec;
	});
	let badgerPerSecond = locked.dividedBy(period.end.minus(period.start))
	let badgerPerSecondAllTime = lockedAllTime.dividedBy(periodAllTime.end.minus(periodAllTime.start))


	return {
		day: badgerPerSecond.multipliedBy(60 * 60 * 24),
		week: badgerPerSecond.multipliedBy(60 * 60 * 24 * 7),
		month: badgerPerSecond.multipliedBy(60 * 60 * 24 * 30),
		year: badgerPerSecondAllTime.multipliedBy(60 * 60 * 24 * 365),
		// ethBalance: !!geyser.totalStakedFor ? new BigNumber(geyser.totalStakedFor).multipliedBy(underlyingToken.ethValue) : new BigNumber(0)
	}

}

export const reduceContractConfig = (configs: any[], payload: any = {}) => {
	let contracts = _.map(configs,
		(config: any) => {
			return _.map(config.contracts,
				(contract: string, i: number) => {
					let r: any = {
						address: contract.toLowerCase(),
						abi: config.abi,
						methods: reduceMethodConfig(config.methods, payload),
						underlyingKey: config.underlying
					}
					if (!!config.fillers)
						_.mapValues(config.fillers, (fillers: any, key: any) => {
							r[key] = fillers[i]
						})
					return r
				})
		})
	return _.keyBy(_.flatten(contracts), 'address')
}

export const reduceMethodConfig = (methods: any[], payload: any) => {
	let reduced = _.map(methods,
		(method: any) => {
			let args = _.map(method.args,
				(arg: string) => {
					let brackets = /\{(.*?)\}/;
					let matches = brackets.exec(arg)
					if (!!matches && !!payload[matches[1]]) {
						return payload[matches[1]]
					} else if (!!matches) {
						return false
					} else {
						return arg
					}

				})
			// assume we shouldn't call the method if payload doesn't include correct variables
			if (args.length > _.compact(args).length) {
				return false
			}

			return {
				name: method.name,
				args: args
			}
		})

	return _.compact(reduced)
}

export const reduceContractsToTokens = (contracts: any) => {
	// grab underlying and yielding token addresses as {address:, contract:}
	let assets: any[] = _.map(contracts, (contract: any, address: string) => {
		return {
			address: contract[contract.underlyingKey].toLowerCase(),
			contract: address.toLowerCase()
		}
	})

	console.log(assets, contracts)

	assets.push([WBTC_ADDRESS, diggToken.contract, rewards.tokens[2]]
		.map((address: string) => ({ address })))

	return _.keyBy(
		_.flatten(assets),
		'address')
}

export const generateCurveTokens = () => {
	return _.keyBy(
		_.zip(curveTokens.contracts, curveTokens.symbols, curveTokens.names)
			.map((token: any[]) => {
				return _.zipObject(['address', 'symbol', 'name'], token)
			})
		, 'address')
}

export const erc20BatchConfig = (contracts: any, connectedAddress: string) => {
	let configs = _.map(contracts, (contract: any, address: string) => {
		if (!!contract.contract)
			return batchConfig('tokens',
				[contract.address],
				erc20Methods(connectedAddress, contract, []),
				ERC20.abi)
	});
	return _.compact(configs)

}
