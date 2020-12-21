import BigNumber from "bignumber.js"

export const graphQuery = (address: string): Promise<Response> => {
	return fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			query: `{  
				token(id: "${address.toLowerCase()}") {
					id
					derivedETH
					symbol
					name
				}
				pair(id: "${address.toLowerCase()}") {
					id
					reserveETH
					totalSupply
					token0{
						name
						symbol
					  }
					   token1{
						name
						symbol
					  }
				}
			}`
		})
	}).then((response: any) => response.json())
}
export const curvePrice = (contract: string, url: string): Promise<Response> => {
	return fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		}
	}).then((response: any) => response.json())
}
export const getExchangeRates = (): Promise<Response> => {
	return fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,btc", {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		}
	}).then((response: any) => response.json())
}

export const growthQuery = (block: number): Promise<Response> => {
	return fetch(`https://api.thegraph.com/subgraphs/name/m4azey/badger-finance`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({
			query: `
			{
			vaults(block:{number:${block}}) {
				id, pricePerFullShare
			}
		}`
		})
	}).then((data) => data.json())
}

export const secondsToBlocks = (seconds: number) => {
	return Math.floor(seconds / 13.5)
}

var exchangeRates: any = undefined
getExchangeRates().then((result: any) => exchangeRates = result.ethereum)

// input: eth value in wei
// output: formatted currency string
export const inCurrency = (value: BigNumber, currency: string, hide: boolean = false) => {
	let normal = value.dividedBy(1e18)
	let prefix = !hide ? 'E ' : ''
	let decimals = 5

	switch (currency) {
		case "eth":
			break
		case "btc":
			normal = normal.multipliedBy(exchangeRates.btc)
			prefix = 'B '
			break
		case "usd":
			prefix = '$'
			decimals = 2
			normal = normal.multipliedBy(exchangeRates.usd)
			break
	}

	let suffix = ''

	if (normal.dividedBy(1e6).gt(1e2)) {
		normal = normal.dividedBy(1e6)
		decimals = 2
		suffix = 'm'
	} else if (normal.dividedBy(1e3).gt(1e2)) {
		normal = normal.dividedBy(1e3)
		decimals = 2
		suffix = 'k'
	}

	return `${prefix}${normal.toFixed(decimals)}${suffix}`

}
