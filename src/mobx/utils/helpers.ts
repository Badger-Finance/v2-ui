
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

