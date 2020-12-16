import BigNumber from "bignumber.js";
import _ from "lodash";


export const reduceBatchResult = (result: any[]): any[] => {
	return result.map((vault) => {
		let reduced = Object.assign({}, vault)

		_.mapKeys(vault, (element: any, name: string) => {

			if (Array.isArray(element)) {
				let value = element[0].value

				// convert numberic values into BigNumbers
				if (/^-?\d+$/.test(value))
					reduced[name] = new BigNumber(value)
				else if (_.isString(value) && value.slice(0, 2) === '0x')
					reduced[name] = (value as string).toLowerCase()
				else
					reduced[name] = value
			}
		});
		return reduced
	})
}
export const reduceGraphResult = (batchResult: any, graphResult: any[]) => {
	let batch = _.clone(batchResult)
	graphResult.forEach((element: any) => {
		if (!element.data.pair && !element.data.token)
			return

		let ethValue = !!element.data.pair ? new BigNumber(element.data.pair.reserveETH).dividedBy(new BigNumber(element.data.pair.totalSupply)) : new BigNumber(element.data.token.derivedETH)
		let tokenAddress = !!element.data.pair ? element.data.pair.id : element.data.token.id

		let token = {
			type: !!element.data.pair ? 'pair' : 'token',
			symbol: !!element.data.pair ? element.data.pair.token0.symbol + '/' + element.data.pair.token1.symbol : element.data.token.symbol,
			name: !!element.data.pair ? element.data.pair.token0.name + '/' + element.data.pair.token1.name : element.data.token.name,
			ethValue: ethValue
		}
		batch[tokenAddress] = { ...token, ...batch[tokenAddress] }
	})

	return batch
}
