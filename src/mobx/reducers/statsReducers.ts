import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { RootStore } from '../store';

import { inCurrency } from '../utils/helpers';
import { token as diggToken } from '../../config/system/rebase';
import { decimals } from 'config/system/tokens';
import { Amount, Geyser, Growth, Token, Vault } from './contractReducers';
import { ZERO_CURRENCY } from 'config/constants';

export const reduceTimeSinceLastCycle = (time: string) => {
	const timestamp = parseFloat(time) * 1000;

	const now = Date.now();
	const timeSinceLastCycle = Math.abs(now - timestamp);
	return (
		Math.floor(timeSinceLastCycle / (60 * 60 * 1000)) +
		'h ' +
		Math.round(((timeSinceLastCycle % 86400000) % 3600000) / 60000) +
		'm'
	);
};

export const reduceRebaseToStats = (store: RootStore) => {
	const { tokens } = store.contracts;
	const { currency } = store.uiState;

	if (!tokens) return;

	const token = tokens[diggToken.contract];

	return {
		nextRebase: new Date(1609106345791),
		oracleRate: inCurrency(token.ethValue, currency),
		totalSupply: !!token.totalSupply && inCurrency(token.totalSupply.multipliedBy(1e9), 'eth', true),
	};
};

export const reduceContractsToStats = (store: RootStore) => {
	const { vaults: vaultContracts, tokens, geysers: geyserContracts } = store.contracts;
	const { currency, hideZeroBal } = store.uiState;

	if (!tokens) return;

	const { tvl, portfolio, wallet, deposits, badgerToken, growth } = calculatePortfolioStats(
		vaultContracts,
		tokens,
		vaultContracts,
		geyserContracts,
	);

	return {
		stats: {
			tvl,
			portfolio,
			wallet,
			deposits,
			badger: badgerToken,
			badgerGrowth: growth.multipliedBy(1e2).toFixed(2),
		},
	};
};

export const reduceClaims = (merkleProof: any, claimedRewards: any[]) => {
	return merkleProof.cumulativeAmounts.map((amount: number, i: number) => {
		return inCurrency(new BigNumber(amount).minus(claimedRewards[1][i]), 'eth', true);
	});
};
export const reduceAirdrops = (airdrops: any) => {
	if (!airdrops.digg) {
		return { digg: '0.00000' };
	}
	return { digg: inCurrency(airdrops.digg, 'eth', true) };
};
function calculatePortfolioStats(vaultContracts: any, tokens: any, vaults: any, geyserContracts: any) {
	let tvl = new BigNumber(0);
	let deposits = new BigNumber(0);
	let wallet = new BigNumber(0);
	let portfolio = new BigNumber(0);
	let growth = new BigNumber(0);
	let liqGrowth = new BigNumber(0);

	_.forIn(vaultContracts, (vault: Vault) => {

		if (!vault.underlyingToken || !vault.underlyingToken.ethValue) return;

		if (!vault.holdingsValue().isNaN())
			tvl = tvl.plus(vault.holdingsValue());

		if (vault.balance.gt(0) && !vault.balanceValue().isNaN()) {
			deposits = deposits.plus(
				vault.balanceValue());
			portfolio = portfolio.plus(
				vault.balanceValue());
		}

		if (vault.underlyingToken.balance.gt(0) && !vault.underlyingToken.balanceValue().isNaN()) {
			wallet = wallet.plus(
				vault.underlyingToken.balanceValue());
			portfolio = portfolio.plus(
				vault.underlyingToken.balanceValue());
		}
	});

	_.forIn(geyserContracts, (geyser: Geyser) => {

		if (!geyser.vault) return;

		if (!geyser.vault.underlyingToken) return;

		if (!!geyser.balance.gt(0) && !geyser.balanceValue().isNaN()) {
			portfolio = portfolio.plus(geyser.balanceValue());
			deposits = deposits.plus(geyser.balanceValue());
		}
	});

	const badger = tokens['0x3472a5a71965499acd81997a54bba8d852c6e53d']
	const badgerToken = !!badger && !!badger.ethValue ? badger.ethValue : new BigNumber(0)
	return { tvl, portfolio, wallet, deposits, badgerToken, growth, liqGrowth };
}

function formatPercentage(ratio: BigNumber) {
	if (ratio.multipliedBy(1e2).lt(1e-2)) return ratio.multipliedBy(1e2).toFixed(4);
	else return ratio.multipliedBy(1e2).toFixed(2);
}
function formatReturn(amount: Amount, geyser: Geyser) {
	let returnValue = amount.amount
		.dividedBy(10 ** amount.token.decimals)
		.multipliedBy(amount.token.ethValue)
	let geyserValue = geyser.holdingsValue()

	let total = returnValue.dividedBy(geyserValue)
	let tooltip = formatPercentage(total)

	return { total, tooltip }
}

export function reduceRebase(stats: any, base: any, token: any) {
	let info = {
		oraclePrice: inCurrency(base.ethValue.multipliedBy(stats.oracleRate), 'usd'),
		btcPrice: inCurrency(base.ethValue, 'usd'),
	};
	return _.defaults(stats, info);
}



export function formatSupply(token: Token) {
	if (!token.totalSupply)
		return ZERO_CURRENCY
	return inCurrency(token.totalSupply.dividedBy(10 ** token.decimals), 'eth', true)
}

export function formatBalance(token: Token) {
	return inCurrency(token.balance.dividedBy(10 ** token.decimals), 'eth', true)
}

export function formatTotalStaked(geyser: Geyser) {
	return inCurrency(geyser.holdings.dividedBy(10 ** geyser.vault.decimals), 'eth', true)
}

export function formatStaked(geyser: Geyser) {
	return inCurrency(geyser.holdings.dividedBy(10 ** geyser.vault.decimals), 'eth', true)
}

export function formatHoldingsValue(vault: Vault, currency: string) {
	return inCurrency(vault.holdingsValue().dividedBy(1e18), currency, true)
}

export function formatBalanceValue(token: Token, currency: string) {
	return inCurrency(token.balanceValue().dividedBy(1e18), currency, true)
}

export function formatGeyserBalanceValue(geyser: Geyser, currency: string) {
	return inCurrency(geyser.balanceValue().dividedBy(1e18), currency, true)
}

export function formatVaultBalanceValue(vault: Vault, currency: string) {
	return inCurrency(vault.balanceValue().dividedBy(1e18), currency, true)
}

export function formatPrice(price: BigNumber, currency: string) {
	return inCurrency(price.dividedBy(1e18), currency, true)
}

export function formatGeyserGrowth(geyser: Geyser, period: string) {
	let total = new BigNumber(0)
	let tooltip = ''

	let rewards = (geyser.rewards as any)[period]
	if (!!rewards
		&& !rewards.amount.isNaN()
		&& rewards.amount.gt(0)) {
		let geyserRewards = formatReturn(rewards, geyser)
		total = total.plus(geyserRewards.total);
		tooltip += geyserRewards.tooltip + '% Badger';
	}
	return { total, tooltip }
}

export function formatVaultGrowth(vault: Vault, period: string) {

	let roiArray = !!vault.growth ? vault.growth.map((growth: Growth) => {

		return !!(growth as any)[period] && {
			tooltip: formatPercentage((growth as any)[period].amount) + '% ' + (growth as any)[period].token.symbol,
			total: (growth as any)[period].amount
		}
	}) : []

	let total = new BigNumber(0)
	let tooltip = ''
	roiArray.forEach((payload: any) => {
		total = total.plus(payload.total)
		tooltip += '+ ' + payload.tooltip
	});

	if (!!vault.geyser) {
		let geyserGrowth = formatGeyserGrowth(vault.geyser, period)

		tooltip += '+ ' + geyserGrowth.tooltip
		total = total.plus(geyserGrowth.total)
	}


	// if (!!vault[period] && !vault[period].isNaN() && !vault[period].eq(0)) {
	// 	growthRaw = growthRaw.plus(vault[period]);
	// 	tooltip += formatPercentage(vault[period]) + '% ' + token.symbol + ' + ';
	// }
	// if (geyser && !!geyser[period] && !geyser[period].isNaN() && !geyser[period].eq(0)) {
	// 	growthRaw = growthRaw.plus(geyser[period]);
	// 	tooltip += formatPercentage(geyser[period]) + '% Badger + ';
	// }
	// if (
	// 	geyser &&
	// 	!!geyser.sushiRewards &&
	// 	!!geyser.sushiRewards[period] &&
	// 	!geyser.sushiRewards[period].isNaN() &&
	// 	!geyser.sushiRewards[period].eq(0)
	// ) {
	// 	growthRaw = growthRaw.plus(geyser.sushiRewards[period]);
	// 	tooltip += formatPercentage(geyser.sushiRewards[period]) + '% xSUSHI + ';
	// }

	// const growth = formatPercentage(growthRaw) + '%';

	// tooltip = tooltip.slice(0, tooltip.length - 2);
	// return { growth, tooltip };



	return {
		roi: formatPercentage(total) + '%',
		roiTooltip: tooltip.slice(2)
	}

}


