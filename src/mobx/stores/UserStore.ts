import { action, extendObservable } from 'mobx';
import { RootStore } from '../RootStore';
import Web3 from 'web3';
import { ExtractedBalances, GuestListInformation, TokenBalances } from 'mobx/model/account/user-balances';
import BigNumber from 'bignumber.js';
import { BalanceNamespace, ContractNamespaces } from 'web3/config/namespaces';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerVault } from 'mobx/model/vaults/badger-vault';
import { ONE_MIN_MS } from 'config/constants';
import { UserBalanceCache } from 'mobx/model/account/user-balance-cache';
import { CachedTokenBalances } from 'mobx/model/account/cached-token-balances';
import { VaultCaps } from 'mobx/model/vaults/vault-cap copy';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { defaultVaultBalance } from 'components-v2/vault-detail/utils';
import { Account, BouncerType, MerkleProof, Network, Vault, VaultData } from '@badger-dao/sdk';
import { fetchClaimProof } from 'mobx/utils/apiV2';
import { Multicall } from 'ethereum-multicall';
import { extractBalanceRequestResults, RequestExtractedResults } from '../utils/user-balances';
import { getChainMulticallContract, parseCallReturnContext } from '../utils/multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';
import { createMulticallRequest } from '../../web3/config/config-utils';
import { ContractCallResults } from 'ethereum-multicall/dist/esm/models';
import { DEBUG } from '../../config/environment';
import { ethers } from 'ethers';

export default class UserStore {
	private store: RootStore;
	private userBalanceCache: UserBalanceCache = {};

	// loading: undefined, error: null, present: object
	public claimProof: RewardMerkleClaim | undefined | null;
	public bouncerProof: MerkleProof | undefined | null;
	public accountDetails: Account | undefined | null;
	public tokenBalances: TokenBalances = {};
	public settBalances: TokenBalances = {};
	public vaultCaps: VaultCaps = {};
	public loadingBalances: boolean;

	constructor(store: RootStore) {
		this.store = store;
		this.loadingBalances = false;

		extendObservable(this, {
			bouncerProof: this.bouncerProof,
			accountDetails: this.accountDetails,
			claimProof: this.claimProof,
			tokenBalances: this.tokenBalances,
			settBalances: this.settBalances,
			vaultCaps: this.vaultCaps,
			loadingBalances: this.loadingBalances,
		});
	}

	/* Read Variables */

	onGuestList(vault: Vault): boolean {
		// allow users who are not connected to nicely view setts
		if (!this.store.onboard.isActive()) {
			return true;
		}
		if (vault.bouncer === BouncerType.Internal) {
			return false;
		}
		if (vault.bouncer === BouncerType.None) {
			return true;
		}
		return !!this.bouncerProof && this.bouncerProof.length > 0;
	}

	get portfolioValue(): BigNumber {
		return this.walletValue.plus(this.vaultValue);
	}

	get walletValue(): BigNumber {
		return Object.values(this.tokenBalances)
			.filter((t) => this.store.vaults.protocolTokens.has(t.token.address))
			.reduce((total, token) => total.plus(token.value), new BigNumber(0));
	}

	get vaultValue(): BigNumber {
		return Object.values(this.settBalances).reduce((total, vault) => total.plus(vault.value), new BigNumber(0));
	}

	get initialized(): boolean {
		const { settMap } = this.store.vaults;

		// no data available
		if (!settMap) {
			return false;
		}

		// no products configured
		if (Object.keys(settMap).length === 0) {
			return true;
		}

		return !this.loadingBalances;
	}

	async reloadBalances(address?: string): Promise<void> {
		const { vaults, user, onboard } = this.store;
		const actions = [];
		const queryAddress = address ?? onboard.address;

		if (vaults.initialized && queryAddress) {
			actions.push(user.updateBalances());
			actions.push(user.loadAccountDetails(queryAddress));
			await Promise.all(actions);
		}
	}

	getVaultBalance(vault: Vault): VaultData {
		const currentVaultBalance = this.getTokenBalance(vault.vaultToken);
		let settBalance = this.accountDetails?.data[vault.vaultToken];

		/**
		 * settBalance data is populated via events from TheGraph and it is possible for it to be behind / fail.
		 * As such, the app also has internally the state of user deposits. Should a settBalance not be available
		 * for a user - this is likely because they have *just* deposited and their deposit does not show in the
		 * graph yet.
		 *
		 * This override simulates a zero earnings settBalance and providers the proper currently deposited
		 * underlying token amount in the expected downstream object.
		 */
		if (!settBalance) {
			settBalance = defaultVaultBalance(vault);
			settBalance.balance = currentVaultBalance.balance.toNumber() * vault.pricePerFullShare;
		}

		return settBalance;
	}

	getBalance(namespace: BalanceNamespace, vault: BadgerVault): TokenBalance {
		switch (namespace) {
			case BalanceNamespace.Vault:
			case BalanceNamespace.GuardedVault:
			case BalanceNamespace.Deprecated:
				const settAddress = Web3.utils.toChecksumAddress(vault.vaultToken.address);
				return this.getOrDefaultBalance(this.settBalances, settAddress);
			case BalanceNamespace.Token:
			default:
				const tokenAddress = Web3.utils.toChecksumAddress(vault.depositToken.address);
				return this.getOrDefaultBalance(this.tokenBalances, tokenAddress);
		}
	}

	getTokenBalance(contract: string): TokenBalance {
		const tokenAddress = Web3.utils.toChecksumAddress(contract);
		const compositeBalances = {
			...this.settBalances,
			...this.tokenBalances,
		};
		return this.getOrDefaultBalance(compositeBalances, tokenAddress);
	}

	/* User Data Retrieval */

	loadBouncerProof = action(async (address: string): Promise<void> => {
		try {
			const proof = await this.store.sdk.api.loadProof(address);
			if (proof) {
				this.bouncerProof = proof;
			}
		} catch {} // ignore non 200 responses
	});

	loadClaimProof = action(async (address: string, chain = Network.Ethereum): Promise<void> => {
		const proof = await fetchClaimProof(Web3.utils.toChecksumAddress(address), chain);
		if (proof) {
			this.claimProof = proof;
			await this.store.rewards.fetchVaultRewards();
		} else {
			this.claimProof = null;
		}
	});

	loadAccountDetails = action(async (address: string): Promise<void> => {
		const accountDetails = await this.store.sdk.api.loadAccount(address);
		if (accountDetails) {
			this.accountDetails = accountDetails;
		}
	});

	updateBalances = action(async (addressOverride?: string, cached?: boolean): Promise<void> => {
		const { address, wallet } = this.store.onboard;
		const { network } = this.store.network;
		const { vaults } = this.store;

		/**
		 * only allow one set of calls at a time, blocked by a loading guard
		 * do not update balances without prices available or a provider, price updates
		 * will trigger balance display updates
		 */
		const queryAddress = addressOverride ?? address;
		if (!queryAddress || !vaults.initialized || this.loadingBalances || !wallet?.provider || !vaults.settMap) {
			return;
		}

		this.loadingBalances = true;

		const cacheKey = `${network.symbol}-${address}`;

		if (cached) {
			const cachedBalances = this.userBalanceCache[cacheKey];
			if (cachedBalances && Date.now() <= cachedBalances.expiry) {
				this.setBalances(cachedBalances);
				this.loadingBalances = false;
				return;
			}
		}

		try {
			const multicallContractAddress = getChainMulticallContract(network.symbol);
			const multicallRequests = network.getBalancesRequests(
				vaults.settMap,
				vaults.getTokenConfigs(),
				queryAddress,
			);

			let multicall;
			let multicallResults;
			try {
				multicall = new Multicall({
					web3Instance: new Web3(wallet.provider),
					tryAggregate: true,
					multicallCustomContractAddress: multicallContractAddress,
				});
				multicallResults = await multicall.call(multicallRequests);
			} catch (err) {
				console.error({
					err,
					message: `This error may be because MulticallV2 is not defined for ${network.name}.`,
				});
				multicall = new Multicall({
					web3Instance: new Web3(wallet.provider),
					multicallCustomContractAddress: multicallContractAddress,
				});
				multicallResults = await multicall.call(multicallRequests);
			}

			const requestResults = extractBalanceRequestResults(multicallResults);
			const { tokenBalances, settBalances } = this.extractBalancesFromResults(requestResults);
			const { guestLists, guestListLookup } = this.extractGuestListInformation(requestResults.userGuardedVaults);
			const guestListRequests = createMulticallRequest(guestLists, ContractNamespaces.GuestList, queryAddress);
			const guestListResults = await multicall.call(guestListRequests);
			const vaultCaps = await this.getVaultCaps(guestListResults, guestListLookup);

			const result = {
				key: cacheKey,
				tokens: tokenBalances,
				setts: settBalances,
				vaultCaps,
				expiry: Date.now() + 5 * ONE_MIN_MS,
			};

			this.userBalanceCache[cacheKey] = result;
			this.setBalances(result);
			this.loadingBalances = false;
		} catch (err) {
			console.error(err);
			this.loadingBalances = false;
		}
	});

	private getOrDefaultBalance(balances: TokenBalances, token: string): TokenBalance {
		const balance = balances[token];
		if (!balance) {
			return this.store.rewards.mockBalance(token);
		}
		return balance;
	}

	private extractBalancesFromResults({
		userTokens,
		userGeneralVaults,
		userGuardedVaults,
		userDeprecatedVaults,
	}: RequestExtractedResults): ExtractedBalances {
		const tokenBalances: TokenBalances = {};
		const settBalances: TokenBalances = {};

		// update all token balances (this is currently incorrect or redundant)
		userTokens.forEach((token) => this.updateUserBalance(tokenBalances, token));

		// add underlying tokens, and sett tokens to user balances
		userGeneralVaults.forEach((vault) => this.updateUserBalance(settBalances, vault));
		userGeneralVaults.forEach((vault) => this.store.vaults.updateAvailableBalance(vault));

		// add guarded underlying tokens, and sett tokens to user balances
		userGuardedVaults.forEach((vault) => this.updateUserBalance(settBalances, vault));
		userGuardedVaults.forEach((vault) => this.store.vaults.updateAvailableBalance(vault));

		// add deprecated underlying tokens, and sett tokens to user balances
		userDeprecatedVaults.forEach((vault) => this.updateUserBalance(settBalances, vault));
		userDeprecatedVaults.forEach((vault) => this.store.vaults.updateAvailableBalance(vault));

		return {
			tokenBalances,
			settBalances,
		};
	}

	private setBalances = action((balances: CachedTokenBalances): void => {
		const { tokens, setts, vaultCaps } = balances;
		this.tokenBalances = tokens;
		this.settBalances = setts;
		this.vaultCaps = vaultCaps;
	});

	private async getVaultCaps(
		guestListResults: ContractCallResults,
		guestListLookup: Record<string, string>,
	): Promise<VaultCaps> {
		const vaultCaps: VaultCaps = {};

		for (const guestListResultsKey in guestListResults.results) {
			const {
				callsReturnContext,
				originalContractCallContext: { contractAddress },
			} = guestListResults.results[guestListResultsKey];

			const result = parseCallReturnContext(callsReturnContext);
			if (
				!result.remainingTotalDepositAllowed ||
				!result.remainingUserDepositAllowed ||
				!result.totalDepositCap ||
				!result.userDepositCap
			) {
				continue;
			}

			const vaultAddress = guestListLookup[contractAddress];
			const vault = this.store.vaults.getVault(vaultAddress);

			if (!vault) {
				continue;
			}

			const depositToken = this.store.vaults.getToken(vault.underlyingToken);

			if (!depositToken) {
				continue;
			}

			const remainingTotalDepositAllowed = result.remainingTotalDepositAllowed[0][0].hex;
			const totalDepositCap = result.totalDepositCap[0][0].hex;
			const remainingUserDepositAllowed = result.remainingUserDepositAllowed[0][0].hex;
			const userDepositCap = result.userDepositCap[0][0].hex;

			vaultCaps[vault.vaultToken] = {
				vaultCap: this.store.rewards.balanceFromProof(depositToken.address, remainingTotalDepositAllowed),
				totalVaultCap: this.store.rewards.balanceFromProof(depositToken.address, totalDepositCap),
				userCap: this.store.rewards.balanceFromProof(depositToken.address, remainingUserDepositAllowed),
				totalUserCap: this.store.rewards.balanceFromProof(depositToken.address, userDepositCap),
				asset: depositToken.symbol,
			};
		}

		return vaultCaps;
	}

	private extractGuestListInformation(guardedVaultsResult: ContractCallReturnContext[]): GuestListInformation {
		const guestListLookup: Record<string, string> = {};
		const guestLists = guardedVaultsResult
			.map((returnContext) => {
				const settAddress = returnContext.originalContractCallContext.contractAddress;
				const vault = parseCallReturnContext(returnContext.callsReturnContext);
				if (!vault.guestList || vault.guestList.length === 0) {
					return null;
				}

				const guestList = vault.guestList[0][0];
				if (guestList === ethers.constants.AddressZero) {
					return null;
				}

				guestListLookup[guestList] = settAddress;
				return guestList;
			})
			.filter(Boolean);

		return { guestLists, guestListLookup };
	}

	/* Update Balance Helpers */

	private updateUserBalance = (tokenBalances: TokenBalances, returnContext: ContractCallReturnContext): void => {
		const { prices, vaults } = this.store;
		const tokenAddress = returnContext.originalContractCallContext.contractAddress;
		const token = parseCallReturnContext(returnContext.callsReturnContext);
		const balanceResults = token.balanceOf || token.totalStakedFor;
		if (!balanceResults || balanceResults.length === 0) {
			return;
		}
		const balanceTokenInfo = vaults.getToken(tokenAddress);
		const balance = new BigNumber(balanceResults[0][0].hex);
		const tokenPrice = prices.getPrice(tokenAddress);
		const key = Web3.utils.toChecksumAddress(tokenAddress);
		tokenBalances[key] = new TokenBalance(balanceTokenInfo, balance, tokenPrice);
	};
}
