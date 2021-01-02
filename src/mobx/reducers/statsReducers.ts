import BigNumber from "bignumber.js";
import _ from "lodash";
import { RootStore } from "../store";
import UiState from "../stores/uiStore";
import { inCurrency } from "../utils/helpers";
import { token as diggToken } from "../../config/system/digg"

export const reduceGeysersToStats = (store: RootStore) => {
	const { vaults, geysers, tokens } = store.contracts
	const { stats, period, currency } = store.uiState

	const config = {}

	return _.mapValues(geysers, (geyser: any, geyserAddress: string) => {

		let vault = !!vaults && vaults[geyser[geyser.underlyingKey]]

		if (!vault || !tokens)
			return

		let token = tokens[vault[vault.underlyingKey]]
		let vaultToken = tokens[vault.address]

		if (!token)
			return

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

	if (!tokens)
		return

	return _.mapValues(vaults, (vault: any, vaultAddress: string) => {
		let token = tokens[vault[vault.underlyingKey]]
		let wrapped = tokens[vault.address]

		let geyser = geysers[wrapped.contract]

		if (!geyser || !token)
			return //console.log(vault, token, wrapped)

		let depositedTokens = !!wrapped.balanceOf ? wrapped.balanceOf.multipliedBy(vault.getPricePerFullShare.dividedBy(1e18)) : new BigNumber(0)
		let { growth, tooltip } = reduceTotalGrowth(vault, period, token, geyser);
		let { growth: growthDay } = reduceTotalGrowth(vault, 'day', token, geyser);
		let { growth: growthMonth } = reduceTotalGrowth(vault, 'month', token, geyser);
		let { growth: growthYear } = reduceTotalGrowth(vault, 'year', token, geyser);

		return {
			vault: vault,
			address: vault.address,

			yourBalance: !!token.balanceOf &&
				inCurrency(token.balanceOf.plus(depositedTokens), 'eth', true),
			yourValue: !!token.balanceOf &&
				inCurrency(token.balanceOf.plus(depositedTokens).multipliedBy(token.ethValue.dividedBy(1e18)), currency),

			anyWrapped: depositedTokens.gt(0),

			underlyingTokens: !!vault.balance &&
				inCurrency(vault.balance, 'eth', true),
			underlyingBalance: !!vault.balance && !!token.ethValue &&
				inCurrency(vault.balance.multipliedBy(token.ethValue.dividedBy(1e18)), currency),

			availableBalance: !!token.balanceOf &&
				inCurrency(token.balanceOf.plus(depositedTokens), 'eth', true),

			availableFull: !!token.balanceOf && {
				25: inCurrency(token.balanceOf.plus(depositedTokens).multipliedBy(0.25), 'eth', true, 18, true),
				50: inCurrency(token.balanceOf.plus(depositedTokens).multipliedBy(0.5), 'eth', true, 18, true),
				75: inCurrency(token.balanceOf.plus(depositedTokens).multipliedBy(0.75), 'eth', true, 18, true),
				100: inCurrency(token.balanceOf.plus(depositedTokens), 'eth', true, 18, true),
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
			growth: growth,
			tooltip,

			year: growthYear,
			month: growthMonth,
			day: growthDay,
		}
	})
}
export const reduceRebaseToStats = (store: RootStore) => {
	const { rebase, tokens } = store.contracts
	const { stats, currency, period } = store.uiState

	if (!tokens)
		return

	const token = tokens[diggToken.contract]

	return {
		nextRebase: new Date(1609106345791),
		oracleRate: inCurrency(token.ethValue, currency),
		totalSupply: !!token.totalSupply && inCurrency(token.totalSupply.multipliedBy(1e9), 'eth', true),
	}
}


export const reduceContractsToStats = (store: RootStore) => {
	let { vaults: vaultContracts, tokens, geysers: geyserContracts } = store.contracts
	let { currency } = store.uiState

	if (!tokens)
		return

	let tvl = new BigNumber(0)
	let wallet = new BigNumber(0)
	let geysers = new BigNumber(0)
	let portfolio = new BigNumber(0)
	let growth = new BigNumber(0)
	let liqGrowth = new BigNumber(0)

	_.forIn(vaultContracts, (vault: any, address: string) => {
		let token = tokens[vault[vault.underlyingKey]]
		let wrapped = tokens[vault.address]
		if (!token)
			return

		tvl = tvl.plus(vault.balance.dividedBy(1e18).multipliedBy(vault.getPricePerFullShare.dividedBy(1e18)).multipliedBy(token.ethValue))

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
		let vault = vaultContracts[geyser[geyser.underlyingKey]]
		if (!vault)
			return

		let token = tokens[vault[vault.underlyingKey]]

		if (!token)
			return

		if (token.symbol === "BADGER" && !!vault.year)
			growth = vault.year.plus(geyser.year)

		if (token.symbol === "WBTC/BADGER" && !!vault.year) {
			let growthSum = vault.year.plus(geyser.year)
			if (!!vault.sushiGrowth)
				growthSum = growthSum.plus(vault.sushiGrowth.year)
			if (!!vault.year && growthSum.gt(liqGrowth))
				liqGrowth = growthSum
		}

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
		wallet: inCurrency(wallet, currency),
		geysers: inCurrency(geysers, currency),
		badger: !!tokens && inCurrency(badgerToken, currency),
		badgerGrowth: growth.multipliedBy(1e2).toFixed(2),
		badgerLiqGrowth: liqGrowth.multipliedBy(1e2).toFixed(2)
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
function reduceTotalGrowth(vault: any, period: string, token: any, geyser: any) {
	let growth = "100%";
	let tooltip = "";
	let growthRaw = new BigNumber(0);

	if (!!vault[period] && !vault[period].isNaN() && !vault[period].eq(0)) {
		growthRaw = growthRaw.plus(vault[period]);
		tooltip += vault[period].multipliedBy(1e2).toFixed(2) + "% " + token.symbol + " + ";
	}
	if (!!geyser[period] && !geyser[period].isNaN() && !geyser[period].eq(0)) {
		growthRaw = growthRaw.plus(geyser[period]);
		tooltip += geyser[period].multipliedBy(1e2).toFixed(2) + "% Badger + ";
	}
	if (!!geyser.sushiRewards && !!geyser.sushiRewards[period] && !geyser.sushiRewards[period].isNaN() && !geyser.sushiRewards[period].eq(0)) {
		growthRaw = growthRaw.plus(geyser.sushiRewards[period]);
		tooltip += geyser.sushiRewards[period].multipliedBy(1e2).toFixed(2) + "% SUSHI + ";
	}

	growth = growthRaw.multipliedBy(1e2).toFixed(2) + "%";

	tooltip = tooltip.slice(0, tooltip.length - 2);
	return { growth, tooltip };
}

