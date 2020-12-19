import BigNumber from "bignumber.js";
import _ from "lodash";


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


export const reduceCurveResult = (graphResult: any[], contracts: any[], wbtcToken: any) => {
	return graphResult.map((result: any, i: number) => { return { address: contracts[i], virtualPrice: new BigNumber(result[0].virtual_price), ethValue: new BigNumber(result[0].virtual_price).multipliedBy(wbtcToken.ethValue).dividedBy(1e18) } })
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

	let average: any = {
		day: new BigNumber(0),
		week: new BigNumber(0),
		month: new BigNumber(0),
		year: new BigNumber(0),
		start: new BigNumber(0),
	}
	_.forIn(vaults, (vault: any) =>
		_.forIn(vault, (data: any, key: string) => {
			average[key] = (average[key] as BigNumber).plus(data)
		}))

	const length = _.keys(vaults).length
	return {
		total: _.mapValues(average, (data: BigNumber, key: string) => data.dividedBy(length)),
		vaults
	}

}



interface Currency {
	eth?: BigNumber,
	btc?: BigNumber,
	usd?: BigNumber
}