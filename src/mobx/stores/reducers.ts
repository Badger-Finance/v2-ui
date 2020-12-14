import BigNumber from "bignumber.js";


export const reduceVaults = (vaults: any[]): any[] => {
	console.log(vaults)
	return vaults.map((vault) => {
		let reduced = Object.assign({}, vault)
		Object.keys(vault).forEach(element => {
			if (Array.isArray(vault[element])) {
				let value = vault[element][0].value

				// convert numberic values into BigNumbers
				if (/^-?\d+$/.test(value))
					reduced[element] = new BigNumber(value)
				else
					reduced[element] = value
			}
		});
		return reduced
	})
}
