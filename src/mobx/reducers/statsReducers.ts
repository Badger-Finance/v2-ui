import BigNumber from "bignumber.js";
import _ from "lodash";
import { RootStore } from "../store";
import UiState from "../stores/uiStore";
import { inCurrency } from "../utils/helpers";


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
				25: inCurrency(geyser.totalStakedFor.multipliedBy(0.25), 'eth', true, 18, true),
				50: inCurrency(geyser.totalStakedFor.multipliedBy(0.5), 'eth', true, 18, true),
				75: inCurrency(geyser.totalStakedFor.multipliedBy(0.75), 'eth', true, 18, true),
				100: inCurrency(geyser.totalStakedFor, 'eth', true, 18, true),
			},

			name: token.name,
			symbol: token.symbol,
			vaultGrowth: !!vault[period] && vault[period].multipliedBy(1e2).toFixed(2) + "%",
			geyserGrowth: !!geyser[period] && geyser[period].multipliedBy(1e2).toFixed(2) + "%",
			growth: !!vault[period] && vault[period].plus(geyser[period] || 0).multipliedBy(1e2).toFixed(2) + "%",
		}
	})
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
				25: inCurrency(token.balanceOf.plus(vault.balanceOf).multipliedBy(0.25), 'eth', true, 18, true),
				50: inCurrency(token.balanceOf.plus(vault.balanceOf).multipliedBy(0.5), 'eth', true, 18, true),
				75: inCurrency(token.balanceOf.plus(vault.balanceOf).multipliedBy(0.75), 'eth', true, 18, true),
				100: inCurrency(token.balanceOf.plus(vault.balanceOf), 'eth', true, 18, true),
			},
			wrappedFull: !!wrapped.balanceOf && {
				25: inCurrency(wrapped.balanceOf.multipliedBy(0.25), 'eth', true, 18, true),
				50: inCurrency(wrapped.balanceOf.multipliedBy(0.5), 'eth', true, 18, true),
				75: inCurrency(wrapped.balanceOf.multipliedBy(0.75), 'eth', true, 18, true),
				100: inCurrency(wrapped.balanceOf, 'eth', true, 18, true),
			},

			depositedFull: !!geyser.totalStakedFor && {
				25: inCurrency(geyser.totalStakedFor.multipliedBy(0.25), 'eth', true, 18, true),
				50: inCurrency(geyser.totalStakedFor.multipliedBy(0.5), 'eth', true, 18, true),
				75: inCurrency(geyser.totalStakedFor.multipliedBy(0.75), 'eth', true, 18, true),
				100: inCurrency(geyser.totalStakedFor, 'eth', true, 18, true),
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

		if (token.symbol === "BADGER")
			growth = !!vault.year ? vault.year.plus(geyser.year) : new BigNumber(0)

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
		badger: !!tokens && inCurrency(badgerToken, currency),
		badgerGrowth: growth.multipliedBy(1e2).toFixed(2)

	}

}

export const reduceClaims = (merkleProof: any, claimedRewards: any[]) => {
	return merkleProof.cumulativeAmounts.map((amount: number, i: number) => {
		return inCurrency(new BigNumber(amount).minus(claimedRewards[1][i]), 'eth', true);
	});
}
export const reduceAirdrops = (airdrops: any) => {
	return _.mapValues(airdrops, (amount: BigNumber, token: string) => {
		return inCurrency(amount, 'eth', true);
	});
}
