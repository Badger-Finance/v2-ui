import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { RootStore } from '../store';

import { inCurrency } from '../utils/helpers';
import { token as diggToken } from '../../config/system/digg';

// export const reduceGeysersToStats = (store: RootStore) => {
// 	const { vaults, geysers, tokens } = store.contracts
// 	const { stats, period, currency } = store.uiState

// 	const config = {}

// 	return _.mapValues(geysers, reduceGeyserToStats(vaults, tokens, period, currency))
// }

export const walletAssets = (store: RootStore, hideZeroBal: boolean) => {
	const { vaults, geysers, tokens } = store.contracts;
	const { currency, period } = store.uiState;

	// console.log(_.keysIn(vaults).length)

	if (!tokens) return;

	const walletAssets = _.map(vaults, (vault: any) => {
		const token = !!vault && tokens[vault[vault.underlyingKey]];
		const geyser = _.find(geysers, (g: any) => g[g.underlyingKey] === vault.address);

		if (!token) return console.log('no token', vault.address);
		if (hideZeroBal && token.balanceOf.eq(0)) return;

		// if (token.balanceOf.gt(0))
		return {
			token: token,
			stats: reduceVaultToStats(vault, geyser, tokens, geysers, period, currency),
		};
	});

	return _.sortBy(_.compact(walletAssets), (asset: any) => {
		return !!asset.stats.anyUnderlying ? '0' : asset.stats.vault.listOrder;
		// !!asset.stats && (!asset.stats.anyUnderlying || -asset.stats.vault.listOrder)
	});
};

export const wrappedAssets = (store: RootStore) => {
	const { vaults, geysers, tokens } = store.contracts;
	const { currency, period } = store.uiState;

	if (!tokens) return;

	const walletAssets = _.map(geysers, (geyser: any) => {
		const vault = vaults[geyser[geyser.underlyingKey]];
		if (!vault) return;
		const token = tokens[vault[vault.underlyingKey]];
		const wrapped = tokens[vault.address];

		if (!geyser || !token) return;

		if (!token.balanceOf && !wrapped.balanceOf) return;

		if (wrapped.balanceOf.eq(0)) return;

		return {
			token: wrapped,
			stats: reduceVaultToStats(vault, geyser, tokens, geysers, period, currency, true),
		};
	});

	return _.compact(walletAssets);
};
export const reduceDeposits = (store: RootStore) => {
	const { vaults, geysers, tokens } = store.contracts;
	const { period, currency } = store.uiState;

	const depositedAssets = _.map(geysers, (geyser: any) => {
		const vault = !!vaults && vaults[geyser[geyser.underlyingKey]];

		if (!vault || !tokens) return;

		const token = tokens[vault[vault.underlyingKey]];

		if (!token) return;

		if (!geyser.totalStakedFor || geyser.totalStakedFor.eq(0)) return;

		return {
			token: token,
			stats: reduceGeyserToStats(geyser, vaults, tokens, period, currency),
		};
	});
	return _.sortBy(_.compact(depositedAssets), (geyserAsset: any) => geyserAsset.stats.geyser.listOrder);
};
export const reduceGeysers = (store: RootStore) => {
	const { vaults, geysers, tokens } = store.contracts;
	const { period, currency } = store.uiState;

	let geyserAssets = _.map(geysers, (geyser: any) => {
		const vault = !!vaults && vaults[geyser[geyser.underlyingKey]];

		if (!vault || !tokens) return;

		const token = tokens[vault[vault.underlyingKey]];

		if (!token) return;

		return {
			token: token,
			stats: reduceGeyserToStats(geyser, vaults, tokens, period, currency),
		};
	});

	geyserAssets = _.compact(geyserAssets);

	return _.sortBy(geyserAssets, (geyserAsset: any) => geyserAsset.stats.geyser.listOrder);
};

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
			tvl: inCurrency(tvl, currency),
			portfolio: inCurrency(portfolio, currency),
			wallet: inCurrency(wallet, currency),
			deposits: inCurrency(deposits, currency),
			badger: !!tokens && inCurrency(badgerToken, currency),
			badgerGrowth: growth.multipliedBy(1e2).toFixed(2),
		},
		assets: {
			wallet: walletAssets(store, hideZeroBal),
			wrapped: wrappedAssets(store),
			deposits: reduceDeposits(store),
			setts: reduceGeysers(store),
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

	_.forIn(vaultContracts, (vault: any) => {
		const token = tokens[vault[vault.underlyingKey]];
		const wrapped = vaults[vault.address];
		if (!token || !vault.balance || !token.ethValue) return;

		// console.log(token.symbol, token.ethValue.toString())

		tvl = tvl.plus(
			vault.balance
				.dividedBy(1e18)
				.multipliedBy(vault.getPricePerFullShare.dividedBy(1e18))
				.multipliedBy(token.ethValue),
		);

		if (!!wrapped.balanceOf && wrapped.balanceOf.gt(0)) {
			deposits = deposits.plus(
				wrapped.balanceOf
					.multipliedBy(token.ethValue)
					.multipliedBy(vault.getPricePerFullShare.dividedBy(1e18))
					.dividedBy(1e18),
			);

			portfolio = portfolio.plus(
				wrapped.balanceOf
					.multipliedBy(token.ethValue)
					.multipliedBy(vault.getPricePerFullShare.dividedBy(1e18))
					.dividedBy(1e18),
			);
		}

		if (!!token.balanceOf && token.balanceOf.gt(0)) {
			wallet = wallet.plus(token.balanceOf.multipliedBy(token.ethValue).dividedBy(1e18));
			portfolio = portfolio.plus(token.balanceOf.multipliedBy(token.ethValue).dividedBy(1e18));
		}
	});

	_.forIn(geyserContracts, (geyser: any) => {
		const vault = vaultContracts[geyser[geyser.underlyingKey]];
		if (!vault) return;

		const token = tokens[vault[vault.underlyingKey]];

		if (!token) return;

		if (token.symbol === 'BADGER' && !!vault.year) growth = vault.year.plus(geyser.year);

		if (token.symbol === 'WBTC/BADGER' && !!vault.year) {
			let growthSum = vault.year.plus(geyser.year);
			if (!!vault.sushiGrowth) growthSum = growthSum.plus(vault.sushiGrowth.year);
			if (!!vault.year && growthSum.gt(liqGrowth)) liqGrowth = growthSum;
		}

		if (!!geyser.totalStakedFor) {
			const virtualEthValue = !!token.ethValue
				? token.ethValue.dividedBy(1e18).multipliedBy(vault.getPricePerFullShare.dividedBy(1e18))
				: token.ethValue;
			portfolio = portfolio.plus(geyser.totalStakedFor.multipliedBy(virtualEthValue));
			deposits = deposits.plus(geyser.totalStakedFor.multipliedBy(virtualEthValue));
		}
	});

	const badgerToken = !!tokens && tokens['0x3472a5a71965499acd81997a54bba8d852c6e53d'].ethValue;
	return { tvl, portfolio, wallet, deposits, badgerToken, growth, liqGrowth };
}

function reduceGeyserToStats(geyser: any, vaults: any, tokens: any, period: string, currency: string): any {
	const vault = !!vaults && vaults[geyser[geyser.underlyingKey]];

	if (!vault || !tokens) return;

	const token = tokens[vault[vault.underlyingKey]];

	if (!token) return;

	const virtualEthValue = !!token.ethValue
		? token.ethValue
				.dividedBy(1e18)
				.multipliedBy(!!vault.getPricePerFullShare ? vault.getPricePerFullShare.dividedBy(1e18) : 1)
		: token.ethValue;
	const underlyingBalance =
		!!geyser.totalStakedFor &&
		geyser.totalStakedFor.multipliedBy(
			!!vault.getPricePerFullShare ? vault.getPricePerFullShare.dividedBy(1e18) : 1,
		);

	const { growth, tooltip } = reduceTotalGrowth(vault, period, token, geyser);

	return {
		address: geyser.address,
		vault,
		geyser,

		anyWrapped: !!vault.balanceOf && vault.balanceOf.gt(0),

		underlyingTokens: !!geyser.totalStaked && inCurrency(geyser.totalStaked, 'eth', true),
		underlyingBalance:
			!!geyser.totalStaked && inCurrency(geyser.totalStaked.multipliedBy(virtualEthValue), currency),

		yourValue: !!geyser.totalStakedFor && inCurrency(geyser.totalStakedFor.multipliedBy(virtualEthValue), currency),
		yourBalance: !!underlyingBalance && inCurrency(underlyingBalance, 'eth', true),

		anyStaked: !!underlyingBalance && underlyingBalance.gt(0),

		availableBalance: !!token.balanceOf && inCurrency(token.balanceOf, 'eth', true),

		depositedFull: !!underlyingBalance && {
			25: inCurrency(underlyingBalance.multipliedBy(0.25), 'eth', true, 18, true),
			50: inCurrency(underlyingBalance.multipliedBy(0.5), 'eth', true, 18, true),
			75: inCurrency(underlyingBalance.multipliedBy(0.75), 'eth', true, 18, true),
			100: inCurrency(underlyingBalance, 'eth', true, 18, true),
		},

		name: token.name,
		symbol: token.symbol,
		vaultGrowth: !!vault[period] && vault[period].multipliedBy(1e2).toFixed(2) + '%',
		geyserGrowth: !!geyser[period] && geyser[period].multipliedBy(1e2).toFixed(2) + '%',
		growth: growth,
		tooltip,
	};
}

function reduceVaultToStats(
	vault: any,
	geyser: any,
	tokens: any,
	geysers: any,
	period: string,
	currency: string,
	wrappedOnly = false,
): any {
	const token = tokens[vault[vault.underlyingKey]];

	const wrapped = tokens[vault.address];
	if (!token || !wrapped) return console.log(vault.address, token, wrapped); //console.log(vault, token, wrapped)

	const _depositedTokens = !!vault.balanceOf ? vault.balanceOf : new BigNumber(0);
	const depositedTokens = wrappedOnly ? _depositedTokens : new BigNumber(0);
	const { growth, tooltip } = reduceTotalGrowth(vault, period, token, geyser);
	const { growth: growthDay } = reduceTotalGrowth(vault, 'day', token, geyser);
	const { growth: growthMonth } = reduceTotalGrowth(vault, 'month', token, geyser);
	const { growth: growthYear } = reduceTotalGrowth(vault, 'year', token, geyser);

	const tokenBalance = wrappedOnly ? new BigNumber(0) : !!token.balanceOf ? token.balanceOf : new BigNumber(0);

	const availableFull = !!tokenBalance && {
		25: inCurrency(tokenBalance.plus(depositedTokens).multipliedBy(0.25), 'eth', true, 18, true),
		50: inCurrency(tokenBalance.plus(depositedTokens).multipliedBy(0.5), 'eth', true, 18, true),
		75: inCurrency(tokenBalance.plus(depositedTokens).multipliedBy(0.75), 'eth', true, 18, true),
		100: inCurrency(tokenBalance.plus(depositedTokens), 'eth', true, 18, true),
	};
	const wrappedFull = !!wrapped.balanceOf && {
		25: inCurrency(wrapped.balanceOf.multipliedBy(0.25), 'eth', true, 18, true),
		50: inCurrency(wrapped.balanceOf.multipliedBy(0.5), 'eth', true, 18, true),
		75: inCurrency(wrapped.balanceOf.multipliedBy(0.75), 'eth', true, 18, true),
		100: inCurrency(wrapped.balanceOf, 'eth', true, 18, true),
	};

	return {
		vault,
		geyser,
		address: vault.address,

		anyWrapped: wrappedOnly,
		anyUnderlying: tokenBalance.gt(0) || (!!vault.balanceOf && vault.balanceOf.gt(0)),

		underlyingTokens: !!vault.balance && inCurrency(vault.balance, 'eth', true),
		underlyingBalance:
			!!vault.balance &&
			!!token.ethValue &&
			inCurrency(vault.balance.multipliedBy(token.ethValue.dividedBy(1e18)), currency),

		availableBalance: wrappedOnly
			? inCurrency(depositedTokens, 'eth', true)
			: !!tokenBalance && inCurrency(tokenBalance, 'eth', true),
		yourValue:
			!!token.ethValue &&
			inCurrency(tokenBalance.plus(depositedTokens).multipliedBy(token.ethValue.dividedBy(1e18)), currency),

		availableFull: wrappedOnly ? wrappedFull : availableFull,

		wrappedFull,

		depositedFull: !!geyser &&
			!!geyser.totalStakedFor && {
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
	};
}

function reduceTotalGrowth(vault: any, period: string, token: any, geyser: any = {}) {
	let tooltip = '';
	let growthRaw = new BigNumber(0);

	if (!!vault[period] && !vault[period].isNaN() && !vault[period].eq(0)) {
		growthRaw = growthRaw.plus(vault[period]);
		tooltip += formatPercentage(vault[period]) + '% ' + token.symbol + ' + ';
	}
	if (!!geyser[period] && !geyser[period].isNaN() && !geyser[period].eq(0)) {
		growthRaw = growthRaw.plus(geyser[period]);
		tooltip += formatPercentage(geyser[period]) + '% Badger + ';
	}
	if (
		!!geyser.sushiRewards &&
		!!geyser.sushiRewards[period] &&
		!geyser.sushiRewards[period].isNaN() &&
		!geyser.sushiRewards[period].eq(0)
	) {
		growthRaw = growthRaw.plus(geyser.sushiRewards[period]);
		tooltip += formatPercentage(geyser.sushiRewards[period]) + '% xSUSHI + ';
	}

	const growth = formatPercentage(growthRaw) + '%';

	tooltip = tooltip.slice(0, tooltip.length - 2);
	return { growth, tooltip };
}

function formatPercentage(ratio: BigNumber) {
	if (ratio.multipliedBy(1e2).lt(1e-2)) return ratio.multipliedBy(1e2).toFixed(4);
	else return ratio.multipliedBy(1e2).toFixed(2);
}

export function reduceRebase(stats: any, base: any, token: any) {
	let info = {
		// marketCap: token.totalSupply.multipliedBy(token.ethValue),
		oraclePrice: inCurrency(base.ethValue.multipliedBy(stats.oracleRate), 'usd'),
		btcPrice: inCurrency(base.ethValue, 'usd'),
	};
	return _.defaults(stats, info);

	// decimals: decimals,
	// lastRebaseTimestampSec: lastRebaseTimestampSec,
	// minRebaseTimeIntervalSec: minRebaseTimeIntervalSec,
	// rebaseLag: keyedResult.policy[0].rebaseLag[0].value,
	// epoch: keyedResult.policy[0].epoch[0].value,
	// inRebaseWindow: keyedResult.policy[0].inRebaseWindow[0].value,
	// rebaseWindowLengthSec: parseInt(keyedResult.policy[0].rebaseWindowLengthSec[0].value),
	// oracleRate: new BigNumber(keyedResult.oracle[0].providerReports[0].value.payload).dividedBy(1e18),
	// derivedEth: result[1].data.token.derivedETH,
	// nextRebase: getNextRebase(minRebaseTimeIntervalSec, lastRebaseTimestampSec),
	// pastRebase: rebaseLog,
}
