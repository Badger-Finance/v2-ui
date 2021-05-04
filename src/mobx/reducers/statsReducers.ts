import BigNumber from 'bignumber.js';
import _ from 'lodash';
import { RootStore } from 'mobx/store';
import { inCurrency, formatTokens } from 'mobx/utils/helpers';
import { getDiggPerShare } from 'mobx/utils/diggHelpers';
import {
	Vault,
	Amount,
	Geyser,
	Token,
	RebaseToStats,
	ContractToStats,
	ReducedAirdops,
	ReduceAirdropsProps,
	TokenRebaseStats,
	Network,
	RewardMerkleClaim,
	TreeClaimData,
	UserClaimData,
} from '../model';
import { ZERO_CURRENCY } from 'config/constants';

export const reduceTimeSinceLastCycle = (time: number): string => {
	const timestamp = time * 1000;
	const timeSinceLastCycle = Math.abs(Date.now() - timestamp);
	return (
		Math.floor(timeSinceLastCycle / (60 * 60 * 1000)) +
		'h ' +
		Math.round(((timeSinceLastCycle % 86400000) % 3600000) / 60000) +
		'm'
	);
};

export const reduceRebaseToStats = (store: RootStore): RebaseToStats | undefined => {
	const { tokens } = store.contracts;
	const { currency } = store.uiState;
	const { network } = store.wallet;

	if (!tokens) return;
	if (!network.deploy) return;

	const token = tokens[network.deploy['digg_system']['uFragments']];

	return {
		nextRebase: new Date('Jan 23 8:00PM UTC'),
		oracleRate: inCurrency(token.ethValue, currency),
		totalSupply: !!token.totalSupply && inCurrency(token.totalSupply.multipliedBy(1e9), 'eth', true),
	};
};

export const reduceContractsToStats = (store: RootStore): ContractToStats | undefined => {
	const { vaults: vaultContracts, tokens, geysers: geyserContracts } = store.contracts;
	const { network } = store.wallet;

	if (!tokens) {
		if (process.env.REACT_APP_BUILD_ENV !== 'production') console.log('no tokens identified');
		return;
	}

	const { tvl, portfolio, wallet, deposits, badgerToken, diggToken, bDigg, vaultDeposits } = calculatePortfolioStats(
		vaultContracts,
		geyserContracts,
		tokens,
		network,
	);

	return {
		stats: {
			tvl,
			portfolio,
			wallet,
			bDigg,
			deposits,
			badger: badgerToken,
			digg: diggToken,
			vaultDeposits,
		},
	};
};

export const reduceClaims = (proof: RewardMerkleClaim, claimedRewards: TreeClaimData): UserClaimData[] => {
	if (!proof.cumulativeAmounts) {
		return [];
	}

	const claimableTokens = proof.cumulativeAmounts.length;
	const tokenClaims = [];

	const amounts = claimedRewards[1];
	for (let i = 0; i < claimableTokens; i++) {
		const token = proof.tokens[i];
		const claimed = amounts[i];
		const earned = new BigNumber(proof.cumulativeAmounts[i]);
		const amount = earned.minus(claimed);
		tokenClaims.push({ token, amount });
	}

	return tokenClaims;
};

export const reduceAirdrops = (airdrops: ReduceAirdropsProps, store: RootStore): ReducedAirdops => {
	const { network } = store.wallet;
	if (!airdrops.bBadger || !network.deploy) {
		return {};
	}
	return {
		bBadger: {
			amount: airdrops.bBadger,
			token: store.contracts.tokens[network.deploy.sett_system.vaults['native.badger']],
		},
	};
};

function calculatePortfolioStats(vaultContracts: any, geyserContracts: any, tokens: any, network: Network) {
	let tvl = new BigNumber(0);
	let deposits = new BigNumber(0);
	let vaultDeposits = new BigNumber(0);
	let wallet = new BigNumber(0);
	let portfolio = new BigNumber(0);
	const liqGrowth = new BigNumber(0);

	_.forIn(vaultContracts, (vault: Vault) => {
		if (!vault.underlyingToken || !vault.underlyingToken.ethValue) return;
		if (!vault.holdingsValue().isNaN()) tvl = tvl.plus(vault.holdingsValue());
		if (vault.balance.gt(0) && !vault.balanceValue().isNaN()) {
			const diggMultiplier = vault.underlyingToken.symbol === 'DIGG' ? getDiggPerShare(vault) : new BigNumber(1);
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

		if (!!geyser.balance.gt(0) && !geyser.balanceValue().isNaN()) {
			portfolio = portfolio.plus(geyser.balanceValue());
			vaultDeposits = vaultDeposits.plus(geyser.balanceValue());
		}
	});

	const badger: Token = tokens[network.deploy.token];
	const digg: Token | undefined = network.deploy.digg_system
		? tokens[network.deploy.digg_system.uFragments]
		: undefined;
	const badgerToken = !!badger && !!badger.ethValue ? badger.ethValue : new BigNumber(0);
	const diggToken = !!digg && !!digg.ethValue ? digg.ethValue : new BigNumber(0);
	const bDigg = !!digg && digg.vaults.length > 0 && getDiggPerShare(digg.vaults[0]);
	return { tvl, portfolio, wallet, deposits, badgerToken, diggToken, bDigg, liqGrowth, vaultDeposits };
}

export function reduceRebase(stats: TokenRebaseStats, base: Token): any {
	const info = {
		oraclePrice: base.ethValue.multipliedBy(stats.oracleRate),
		btcPrice: base.ethValue,
	};
	return _.defaults(stats, info);
}

export function formatSupply(token: Token): string {
	if (!token.totalSupply) return ZERO_CURRENCY;
	return inCurrency(token.totalSupply.dividedBy(10 ** token.decimals), 'eth', true);
}

export function formatBalance(token: Token): string {
	if (token) return formatTokens(token.balance.dividedBy(10 ** token.decimals));
	else {
		return '0.00';
	}
}
export function formatGeyserBalance(geyser: Geyser): string {
	return formatTokens(
		geyser.balance
			.plus(geyser.vault.balance)
			.multipliedBy(geyser.vault.pricePerShare)
			.dividedBy(10 ** geyser.vault.decimals),
	);
}
export function formatGeyserHoldings(vault: Vault): string {
	return inCurrency(vault.holdings.multipliedBy(vault.pricePerShare).dividedBy(1e18), 'eth', true);
}
export function formatVaultBalance(vault: Vault): string {
	return inCurrency(vault.vaultBalance.dividedBy(10 ** vault.underlyingToken.decimals), 'eth', true);
}
export function formatTotalStaked(geyser: Geyser): string {
	return inCurrency(
		geyser.holdings.dividedBy(10 ** geyser.vault.decimals).multipliedBy(geyser.vault.pricePerShare),
		'eth',
		true,
	);
}

export function formatBalanceStaked(geyser: Geyser): string {
	const decimals = geyser.vault.symbol === 'byvWBTC' ? 7 : geyser.vault.underlyingToken.decimals;
	return inCurrency(
		geyser.balance.dividedBy(10 ** geyser.vault.decimals).multipliedBy(geyser.vault.pricePerShare),
		'eth',
		true,
		decimals,
	);
}

export function formatStaked(geyser: Geyser): string {
	return inCurrency(geyser.holdings.dividedBy(10 ** geyser.vault.decimals), 'eth', true);
}
export function formatBalanceUnderlying(vault: Vault): string {
	const diggMultiplier = vault.underlyingToken.symbol === 'DIGG' ? getDiggPerShare(vault) : new BigNumber(1);
	return formatTokens(
		vault.balance
			.multipliedBy(vault.pricePerShare)
			.multipliedBy(diggMultiplier)
			.dividedBy(10 ** vault.decimals),
	);
}

export function formatDialogBalanceUnderlying(vault: Vault): string {
	const diggMultiplier = vault.underlyingToken.symbol === 'DIGG' ? getDiggPerShare(vault) : new BigNumber(1);
	return formatTokens(
		vault.balance
			.multipliedBy(vault.pricePerShare)
			.multipliedBy(diggMultiplier)
			.dividedBy(10 ** vault.decimals),
		vault.decimals,
	);
}

export function formatHoldingsValue(vault: Vault, currency: string): string {
	const diggMultiplier = vault.underlyingToken.symbol === 'DIGG' ? getDiggPerShare(vault) : new BigNumber(1);
	return inCurrency(
		vault
			.holdingsValue()
			.multipliedBy(diggMultiplier)
			.dividedBy(10 ** vault.decimals),
		currency,
		true,
	);
}

export function formatBalanceValue(vault: Vault, currency: string): string {
	// Only bDIGG shares need to be scaled, DIGG is already the 1:1 underlying
	const diggMultiplier = vault.symbol === 'bDIGG' ? getDiggPerShare(vault) : new BigNumber(1);
	return inCurrency(vault.balanceValue().multipliedBy(diggMultiplier).dividedBy(1e18), currency, currency != 'eth');
}

export function formatTokenBalanceValue(token: Token, currency: string): string {
	return inCurrency(token.balanceValue().dividedBy(1e18), currency, currency != 'eth');
}

export function formatGeyserBalanceValue(geyser: Geyser, currency: string): string {
	return inCurrency(
		geyser.balanceValue().plus(geyser.vault.balanceValue()).dividedBy(1e18),
		currency,
		currency != 'eth',
	);
}

export function formatVaultBalanceValue(vault: Vault, currency: string): string {
	return inCurrency(vault.balanceValue().dividedBy(10 ** vault.decimals), currency, true);
}

export function formatPrice(price: BigNumber, currency: string): string {
	return inCurrency(price.dividedBy(1e18), currency, currency != 'eth');
}

export function formatNumber(price: BigNumber, currency: string): string {
	return inCurrency(price, currency, true);
}

export function formatAmount(amount: Amount, isVault = false): string {
	let decimals = amount.token.decimals ? amount.token.decimals : amount.token.symbol === 'bDIGG' ? 9 : 18;
	if (isVault) {
		decimals = 18;
	}
	return inCurrency(amount.amount.dividedBy(10 ** decimals), 'eth', true, amount.token.decimals);
}
