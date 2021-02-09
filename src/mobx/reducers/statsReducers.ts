import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { RootStore } from 'mobx/store';
import deploy from 'config/deployments/mainnet.json';
import Web3 from 'web3';

import { inCurrency } from 'mobx/utils/helpers';
import { getDiggPerShare } from 'mobx/utils/diggHelpers';
import { token as diggToken } from 'config/system/rebase';
import { rewards as rewardsConfig } from 'config/system/geysers';
import { Vault, Amount, Geyser, Token, Growth } from '../model';
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
		nextRebase: new Date('Jan 23 8:00PM UTC'),
		oracleRate: inCurrency(token.ethValue, currency),
		totalSupply: !!token.totalSupply && inCurrency(token.totalSupply.multipliedBy(1e9), 'eth', true),
	};
};

export const reduceContractsToStats = (store: RootStore) => {
	const { vaults: vaultContracts, tokens, geysers: geyserContracts } = store.contracts;
	const { currency, hideZeroBal } = store.uiState;

	if (!tokens) return;

	const {
		tvl,
		portfolio,
		wallet,
		deposits,
		badgerToken,
		diggToken,
		growth,
		bDigg,
		vaultDeposits,
	} = calculatePortfolioStats(vaultContracts, tokens, vaultContracts, geyserContracts);

	return {
		stats: {
			tvl,
			portfolio,
			wallet,
			bDigg,
			deposits,
			badger: badgerToken,
			digg: diggToken,
			badgerGrowth: growth.multipliedBy(1e2).toFixed(2),
			vaultDeposits,
		},
	};
};

export const reduceClaims = (merkleProof: any, rewardAddresses: any[], claimedRewards: any[]) => {
	if (!merkleProof.cumulativeAmounts) return [];
	return merkleProof.cumulativeAmounts.map((amount: number, i: number) => {
		return [
			merkleProof.tokens[i],
			new BigNumber(amount).minus(
				claimedRewards[rewardAddresses.indexOf(Web3.utils.toChecksumAddress(merkleProof.tokens[i]))],
			),
		];
	});
};
export const reduceAirdrops = (airdrops: any, store: RootStore) => {
	if (!airdrops.digg) {
		return {};
	}
	return { digg: { amount: airdrops.digg, token: store.contracts.tokens[rewardsConfig.tokens[1].toLowerCase()] } };
};
function calculatePortfolioStats(vaultContracts: any, tokens: any, vaults: any, geyserContracts: any) {
	let tvl = new BigNumber(0);
	let deposits = new BigNumber(0);
	let vaultDeposits = new BigNumber(0);
	let wallet = new BigNumber(0);
	let portfolio = new BigNumber(0);
	let growth = new BigNumber(0);
	let liqGrowth = new BigNumber(0);

	_.forIn(vaultContracts, (vault: Vault) => {
		if (!vault.underlyingToken || !vault.underlyingToken.ethValue) return;

		if (!vault.holdingsValue().isNaN()) tvl = tvl.plus(vault.holdingsValue());

		if (vault.balance.gt(0) && !vault.balanceValue().isNaN()) {
			let diggMultiplier = vault.underlyingToken.symbol === 'DIGG' ? getDiggPerShare(vault) : new BigNumber(1);
			deposits = deposits.plus(vault.balanceValue().multipliedBy(diggMultiplier));
			portfolio = portfolio.plus(vault.balanceValue().multipliedBy(diggMultiplier));
		}

		// No DIGG Multiplier for shares required on baseline DIGG
		if (vault.underlyingToken.balance.gt(0) && !vault.underlyingToken.balanceValue().isNaN()) {
			wallet = wallet.plus(vault.underlyingToken.balanceValue());
			portfolio = portfolio.plus(vault.underlyingToken.balanceValue());
		}
	});

	_.forIn(geyserContracts, (geyser: Geyser) => {
		if (!geyser.vault) return;

		if (!geyser.vault.underlyingToken) return;

		// TODO: Evaluate what should actually be happening here
		if (!!geyser.rewards && geyser.rewards[0].year.amount.isGreaterThan(growth)) growth = new BigNumber(9.1612);

		if (!!geyser.balance.gt(0) && !geyser.balanceValue().isNaN()) {
			portfolio = portfolio.plus(geyser.balanceValue());
			vaultDeposits = vaultDeposits.plus(geyser.balanceValue());
		}
	});

	const badger: Token = tokens[deploy.token.toLowerCase()];
	const digg: Token = tokens[deploy.digg_system.uFragments.toLowerCase()];
	const badgerToken = !!badger && !!badger.ethValue ? badger.ethValue : new BigNumber(0);
	const diggToken = !!digg && !!digg.ethValue ? digg.ethValue : new BigNumber(0);
	const bDigg = !!digg && digg.vaults.length > 0 && getDiggPerShare(digg.vaults[0]);
	return { tvl, portfolio, wallet, deposits, badgerToken, diggToken, bDigg, growth, liqGrowth, vaultDeposits };
}

function formatPercentage(ratio: BigNumber) {
	if (ratio.multipliedBy(1e2).lt(1e-2) && ratio.gt(0)) return ratio.multipliedBy(1e2).toFixed(4);
	else return ratio.multipliedBy(1e2).toFixed(2);
}
function formatReturn(amount: Amount, geyser: Geyser) {
	let returnValue = amount.amount.dividedBy(10 ** amount.token.decimals).multipliedBy(amount.token.ethValue);
	let geyserValue = geyser.holdingsValue();

	let total = returnValue.dividedBy(geyserValue);
	total = total.isNaN() ? new BigNumber(Infinity) : total;
	let tooltip = formatPercentage(total);

	return { total, tooltip };
}

export function reduceRebase(stats: any, base: any, token: any) {
	let info = {
		oraclePrice: base.ethValue.multipliedBy(stats.oracleRate),
		btcPrice: base.ethValue,
	};
	return _.defaults(stats, info);
}

export function formatSupply(token: Token) {
	if (!token.totalSupply) return ZERO_CURRENCY;
	return inCurrency(token.totalSupply.dividedBy(10 ** token.decimals), 'eth', true);
}

export function formatBalance(token: Token): any {
	if (token) return inCurrency(token.balance.dividedBy(10 ** token.decimals), 'eth', true);
	else {
		return '0.00';
	}
}
export function formatGeyserBalance(geyser: Geyser) {
	return inCurrency(
		geyser.balance.plus(geyser.vault.balance).multipliedBy(geyser.vault.pricePerShare).dividedBy(1e18),
		'eth',
		true,
		5,
	);
}
export function formatGeyserHoldings(vault: Vault) {
	return inCurrency(vault.holdings.multipliedBy(vault.pricePerShare).dividedBy(1e18), 'eth', true);
}
export function formatVaultBalance(vault: Vault) {
	return inCurrency(vault.vaultBalance.dividedBy(10 ** vault.underlyingToken.decimals), 'eth', true);
}
export function formatTotalStaked(geyser: Geyser) {
	return inCurrency(
		geyser.holdings.dividedBy(10 ** geyser.vault.decimals).multipliedBy(geyser.vault.pricePerShare),
		'eth',
		true,
	);
}

export function formatBalanceStaked(geyser: Geyser) {
	return inCurrency(
		geyser.balance.dividedBy(10 ** geyser.vault.decimals).multipliedBy(geyser.vault.pricePerShare),
		'eth',
		true,
		geyser.vault.underlyingToken.decimals,
	);
}

export function formatStaked(geyser: Geyser) {
	return inCurrency(geyser.holdings.dividedBy(10 ** geyser.vault.decimals), 'eth', true);
}
export function formatBalanceUnderlying(vault: Vault) {
	let ppfs = vault.symbol === 'bDIGG' ? getDiggPerShare(vault) : vault.pricePerShare;
	return inCurrency(
		vault.balance.multipliedBy(ppfs).dividedBy(10 ** vault.decimals),
		'eth',
		true,
		vault.underlyingToken.decimals,
	);
}

export function formatHoldingsValue(vault: Vault, currency: string) {
	let diggMultiplier = vault.underlyingToken.symbol === 'DIGG' ? getDiggPerShare(vault) : new BigNumber(1);
	return inCurrency(vault.holdingsValue().multipliedBy(diggMultiplier).dividedBy(1e18), currency, true);
}

export function formatBalanceValue(token: Token, currency: string) {
	// Only bDIGG shares need to be scaled, DIGG is already the 1:1 underlying
	const diggMultiplier = token.symbol === 'bDIGG' ? getDiggPerShare(token) : new BigNumber(1);
	return inCurrency(token.balanceValue().multipliedBy(diggMultiplier).dividedBy(1e18), currency, true);
}

export function formatGeyserBalanceValue(geyser: Geyser, currency: string) {
	return inCurrency(geyser.balanceValue().plus(geyser.vault.balanceValue()).dividedBy(1e18), currency, true);
}

export function formatVaultBalanceValue(vault: Vault, currency: string) {
	return inCurrency(vault.balanceValue().dividedBy(1e18), currency, true);
}

export function formatPrice(price: BigNumber, currency: string) {
	return inCurrency(price.dividedBy(1e18), currency, true);
}

export function formatNumber(price: BigNumber, currency: string) {
	return inCurrency(price, currency, true);
}

export function formatAmount(amount: Amount, isVault: boolean = false) {
	let decimals = amount.token.decimals ? amount.token.decimals : amount.token.symbol === 'bDIGG' ? 9 : 18;
	if (isVault) {
		decimals = 18;
	}
	return inCurrency(amount.amount.dividedBy(10 ** decimals), 'eth', true, amount.token.decimals);
}

export function formatGeyserGrowth(geyser: Geyser, period: string) {
	let total = new BigNumber(0);
	let tooltip = '';
	_.map(geyser.rewards, (growth: Growth) => {
		let rewards = (growth as any)[period];

		if (!!rewards.amount && !rewards.amount.isNaN() && rewards.amount.gt(0)) {
			let geyserRewards = formatReturn(rewards, geyser);
			total = total.plus(geyserRewards.total);
			if (geyserRewards.tooltip !== '') tooltip += ' + ' + geyserRewards.tooltip + `% ${rewards.token.symbol}`;
		}
	});
	return { total, tooltip };
}

export function formatVaultGrowth(vault: Vault, period: string) {
	let roiArray = !!vault.growth
		? vault.growth.map((growth: Growth) => {
				return (
					!!(growth as any)[period] && {
						tooltip:
							formatPercentage((growth as any)[period].amount) +
							'% ' +
							(growth as any)[period].token.symbol,
						total: (growth as any)[period].amount,
					}
				);
		  })
		: [];

	let total = new BigNumber(0);
	let tooltip = '';
	roiArray.forEach((payload: any) => {
		total = total.plus(payload.total);
		tooltip += ' + ' + payload.tooltip;
	});

	if (!!vault.geyser) {
		let geyserGrowth = formatGeyserGrowth(vault.geyser, period);

		tooltip += geyserGrowth.tooltip;
		total = total.plus(geyserGrowth.total);
	}

	total = total.isNaN() || total.isEqualTo(0) ? new BigNumber(Infinity) : total;

	return {
		roi: formatPercentage(total) + '%',
		roiTooltip: tooltip.slice(3),
	};
}
