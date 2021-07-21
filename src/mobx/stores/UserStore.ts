import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../store';
import { checkShopEligibility, fetchBouncerProof, fetchClaimProof, getAccountDetails } from 'mobx/utils/apiV2';
import WalletStore from './walletStore';
import Web3 from 'web3';
import { UserBalances } from 'mobx/model/account/user-balances';
import BatchCall from 'web3-batch-call';
import { BatchCallClient } from 'web3/interface/batch-call-client';
import BigNumber from 'bignumber.js';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { BadgerToken, mockToken } from 'mobx/model/tokens/badger-token';
import { CallResult } from 'web3/interface/call-result';
import { DEBUG, ONE_MIN_MS, ZERO_ADDR } from 'config/constants';
import { UserBalanceCache } from 'mobx/model/account/user-balance-cache';
import { CachedUserBalances } from 'mobx/model/account/cached-user-balances';
import { createBatchCallRequest } from 'web3/config/config-utils';
import { VaultCaps } from 'mobx/model/vaults/vault-cap copy';
import { VaultCap } from 'mobx/model/vaults/vault-cap';
import { Account } from '../model/account/account';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { UserPermissions } from '../model/account/userPermissions';

export default class UserStore {
	private store!: RootStore;
	private batchCall: BatchCallClient;
	private userBalanceCache: UserBalanceCache = {};

	// loading: undefined, error: null, present: object
	private permissions: UserPermissions | undefined | null;
	public claimProof: RewardMerkleClaim | undefined | null;
	public bouncerProof: string[] | undefined | null;
	public accountDetails: Account | undefined | null;
	public tokenBalances: UserBalances = {};
	public settBalances: UserBalances = {};
	public geyserBalances: UserBalances = {};
	public vaultCaps: VaultCaps = {};
	public loadingBalances: boolean;

	constructor(store: RootStore) {
		this.store = store;
		this.batchCall = new BatchCall({ web3: this.store.wallet.provider });
		this.loadingBalances = false;

		extendObservable(this, {
			permissions: this.permissions,
			bouncerProof: this.bouncerProof,
			viewSettShop: this.viewSettShop,
			accountDetails: this.accountDetails,
			claimProof: this.claimProof,
			tokenBalances: this.tokenBalances,
			settBalances: this.settBalances,
			geyserBalances: this.geyserBalances,
			vaultCaps: this.vaultCaps,
			loadingBalances: this.loadingBalances,
		});

		/**
		 * Update account store on change of address.
		 */
		observe(this.store.wallet as WalletStore, 'connectedAddress', () => {
			if (!this.loadingBalances) {
				const address = this.store.wallet.connectedAddress;
				const network = this.store.wallet.network;
				this.permissions = undefined;
				this.bouncerProof = undefined;
				this.accountDetails = undefined;
				if (address) {
					this.getSettShopEligibility(address);
					this.loadBouncerProof(address);
					this.loadAccountDetails(address, network.name);
					this.loadClaimProof(address);
					this.updateBalances(true);
				}
			}
		});

		/**
		 * Update account store on change of network.
		 */
		observe(this.store.wallet as WalletStore, 'network', () => {
			if (!this.loadingBalances) {
				this.refreshBalances();
			}
		});
	}

	/* State Mutation Functions */

	refreshBalances(): void {
		this.refreshProvider();
		this.updateBalances(true);
	}

	refreshProvider(): void {
		const provider = this.store.wallet.provider;
		if (provider) {
			const newOptions = {
				web3: new Web3(provider),
			};
			this.batchCall = new BatchCall(newOptions);
		}
	}

	/* Read Variables */

	viewSettShop(): boolean {
		if (!this.permissions) {
			return false;
		}
		return this.permissions.viewSettShop;
	}

	get portfolioValue(): BigNumber {
		return this.walletValue.plus(this.settValue).plus(this.geyserValue);
	}

	get walletValue(): BigNumber {
		return Object.values(this.tokenBalances).reduce((total, token) => total.plus(token.value), new BigNumber(0));
	}

	get settValue(): BigNumber {
		return Object.values(this.settBalances).reduce((total, sett) => total.plus(sett.value), new BigNumber(0));
	}

	get geyserValue(): BigNumber {
		return Object.values(this.geyserBalances).reduce((total, geyser) => total.plus(geyser.value), new BigNumber(0));
	}

	get initialized(): boolean {
		const { settMap } = this.store.setts;
		if (!settMap) {
			return false;
		}
		const hasTokens = Object.keys(this.tokenBalances).length > 0;
		const hasSetts = Object.keys(this.settBalances).length > 0;
		let hasGeysers = false;

		const { network, connectedAddress } = this.store.wallet;
		const geyserRequests = network
			.batchRequests(settMap, connectedAddress)
			.find((req) => req.namespace === ContractNamespace.Geyser);
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
		if (geyserRequests!.addresses && geyserRequests!.addresses.length === 0) {
			hasGeysers = true;
		} else {
			hasGeysers = Object.keys(this.geyserBalances).length > 0;
		}

		return !this.loadingBalances && hasTokens && hasSetts && hasGeysers;
	}

	getBalance(namespace: ContractNamespace, sett: BadgerSett): TokenBalance {
		switch (namespace) {
			case ContractNamespace.Sett:
			case ContractNamespace.GaurdedSett:
				const settAddress = Web3.utils.toChecksumAddress(sett.vaultToken.address);
				return this.getOrDefaultBalance(this.settBalances, settAddress);
			case ContractNamespace.Geyser:
				if (!sett.geyser) {
					throw new Error(`${sett.vaultToken.address} does not have a geyser`);
				}
				const geyserAdress = Web3.utils.toChecksumAddress(sett.geyser);
				return this.getOrDefaultBalance(this.geyserBalances, geyserAdress);
			case ContractNamespace.Token:
			default:
				const tokenAddress = Web3.utils.toChecksumAddress(sett.depositToken.address);
				return this.getOrDefaultBalance(this.tokenBalances, tokenAddress);
		}
	}

	getTokenBalance(token: BadgerToken): TokenBalance {
		const tokenAddress = Web3.utils.toChecksumAddress(token.address);
		return this.getOrDefaultBalance(this.tokenBalances, tokenAddress);
	}

	private getOrDefaultBalance(balances: UserBalances, token: string): TokenBalance {
		const balance = balances[token];
		if (!balance) {
			return this.store.rewards.mockBalance(token);
		}
		return balance;
	}

	updateBalances = action(
		async (cached?: boolean): Promise<void> => {
			const { connectedAddress, network, provider } = this.store.wallet;
			const { setts } = this.store;

			/**
			 * only allow one set of calls at a time, blocked by a loading guard
			 * do not update balances without prices available or a provider, price updates
			 * will trigger balance display updates
			 */
			if (!connectedAddress || !setts.initialized || this.loadingBalances || !provider || !setts.settMap) {
				return;
			}
			this.loadingBalances = true;

			const cacheKey = `${network.name}-${connectedAddress}`;
			if (cached) {
				const cachedBalances = this.userBalanceCache[cacheKey];
				if (cachedBalances && Date.now() <= cachedBalances.expiry) {
					this.setBalances(cachedBalances);
					this.loadingBalances = false;
					return;
				}
			}

			// construct & execute batch requests
			const batchRequests = network.batchRequests(setts.settMap, connectedAddress);
			if (!batchRequests || batchRequests.length === 0) {
				return;
			}
			this.refreshProvider();
			const callResults: CallResult[] = await this.batchCall.execute(batchRequests);
			if (DEBUG) {
				console.log({ network: network.name, callResults });
			}

			// filter batch requests by namespace
			const userTokens = callResults.filter((result) => result.namespace === ContractNamespace.Token);
			const userGeneralSetts = callResults.filter((result) => result.namespace === ContractNamespace.Sett);
			const userGuardedSetts = callResults.filter((result) => result.namespace === ContractNamespace.GaurdedSett);
			const userGeysers = callResults.filter((result) => result.namespace === ContractNamespace.Geyser);

			const tokenBalances: UserBalances = {};
			const settBalances: UserBalances = {};
			const geyserBalances: UserBalances = {};

			// update all account balances
			userTokens.forEach((token) => this.updateUserBalance(tokenBalances, token, this.getDepositToken));
			userGeneralSetts.forEach((sett) => this.updateUserBalance(settBalances, sett, this.getSettToken));
			userGuardedSetts.forEach((sett) => this.updateUserBalance(settBalances, sett, this.getSettToken));
			userGeysers.forEach((geyser) => this.updateUserBalance(geyserBalances, geyser, this.getGeyserMockToken));

			const guestListLookup: Record<string, string> = {};
			const guestLists = userGuardedSetts
				.map((sett) => {
					if (!sett.address || !sett.guestList || sett.guestList.length === 0) {
						return;
					}
					const guestList = sett.guestList[0].value;
					if (guestList === ZERO_ADDR) {
						return;
					}
					guestListLookup[guestList] = sett.address;
					return guestList;
				})
				.filter((list): list is string => !!list);
			const guestListRequests = createBatchCallRequest(guestLists, ContractNamespace.GuestList, connectedAddress);
			const guestListResults: CallResult[] = await this.batchCall.execute([guestListRequests]);
			if (DEBUG) {
				console.log(guestListResults);
			}
			const vaultCaps: VaultCaps = Object.fromEntries(
				guestListResults
					.map((result) => {
						if (
							!result.address ||
							!result.remainingTotalDepositAllowed ||
							!result.remainingUserDepositAllowed ||
							!result.totalDepositCap ||
							!result.userDepositCap
						) {
							return;
						}
						const vaultAddress = guestListLookup[result.address];
						const vault = this.store.setts.getSett(vaultAddress);
						if (!vault) {
							return;
						}
						const depositToken = this.store.setts.getToken(vault.underlyingToken);
						if (!depositToken) {
							return;
						}
						const remainingTotalDepositAllowed = result.remainingTotalDepositAllowed[0].value;
						const totalDepositCap = result.totalDepositCap[0].value;
						const remainingUserDepositAllowed = result.remainingUserDepositAllowed[0].value;
						const userDepositCap = result.userDepositCap[0].value;
						const cap: VaultCap = {
							vaultCap: this.store.rewards.balanceFromProof(
								depositToken.address,
								remainingTotalDepositAllowed,
							),
							totalVaultCap: this.store.rewards.balanceFromProof(depositToken.address, totalDepositCap),
							userCap: this.store.rewards.balanceFromProof(
								depositToken.address,
								remainingUserDepositAllowed,
							),
							totalUserCap: this.store.rewards.balanceFromProof(depositToken.address, userDepositCap),
							asset: depositToken.symbol,
						};
						return [vault.vaultToken, cap];
					})
					.filter((value): value is [] => !!value),
			);

			const result = {
				key: cacheKey,
				tokens: tokenBalances,
				setts: settBalances,
				geysers: geyserBalances,
				vaultCaps,
				expiry: Date.now() + 5 * ONE_MIN_MS,
			};
			this.userBalanceCache[cacheKey] = result;
			this.setBalances(result);
			this.loadingBalances = false;
		},
	);

	private setBalances = (balances: CachedUserBalances): void => {
		const { tokens, setts, geysers, vaultCaps } = balances;
		this.tokenBalances = tokens;
		this.settBalances = setts;
		this.geyserBalances = geysers;
		this.vaultCaps = vaultCaps;
	};

	/* Update Balance Helpers */

	private updateUserBalance = (
		userBalances: UserBalances,
		token: CallResult,
		getToken: (sett: BadgerSett) => BadgerToken,
	): void => {
		const { prices, wallet } = this.store;
		const { network } = wallet;
		const balanceResults = token.balanceOf || token.totalStakedFor;
		if (!balanceResults || balanceResults.length === 0) {
			return;
		}
		const balance = new BigNumber(balanceResults[0].value);
		const sett = network.setts.find((sett) => getToken(sett).address === token.address);
		if (!sett) {
			return;
		}
		const balanceToken = getToken(sett);
		let pricingToken = balanceToken.address;
		if (sett.geyser && sett.geyser === pricingToken) {
			pricingToken = sett.vaultToken.address;
		}
		const tokenPrice = prices.getPrice(pricingToken);
		const key = Web3.utils.toChecksumAddress(balanceToken.address);
		userBalances[key] = new TokenBalance(balanceToken, balance, tokenPrice);
	};

	/* Token Balance Accessors */

	private getDepositToken = (sett: BadgerSett): BadgerToken => sett.depositToken;
	private getSettToken = (sett: BadgerSett): BadgerToken => sett.vaultToken;
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
	private getGeyserMockToken = (sett: BadgerSett): BadgerToken => mockToken(sett.geyser!, sett.vaultToken.decimals);

	/* User Data Retrieval */

	getSettShopEligibility = action(
		async (address: string): Promise<void> => {
			const eligibility = await checkShopEligibility(address);
			if (eligibility) {
				this.permissions = {
					viewSettShop: eligibility.isEligible,
				};
			}
		},
	);

	loadBouncerProof = action(
		async (address: string): Promise<void> => {
			const proof = await fetchBouncerProof(address);
			if (proof) {
				this.bouncerProof = proof.proof;
			}
		},
	);

	loadClaimProof = action(
		async (address: string): Promise<void> => {
			const proof = await fetchClaimProof(Web3.utils.toChecksumAddress(address));
			if (proof) {
				this.claimProof = proof;
				await this.store.rewards.fetchSettRewards();
			} else {
				this.claimProof = undefined;
			}
		},
	);

	loadAccountDetails = action(
		async (address: string, chain?: string): Promise<void> => {
			const accountDetails = await getAccountDetails(address, chain ? chain : 'eth');
			if (accountDetails) {
				this.accountDetails = accountDetails;
			}
		},
	);
}
