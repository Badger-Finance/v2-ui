
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