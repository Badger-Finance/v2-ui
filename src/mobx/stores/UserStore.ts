import { action, extendObservable, observe } from 'mobx';
import { RootStore } from '../RootStore';
import { checkShopEligibility, fetchBouncerProof, fetchClaimProof, getAccountDetails } from 'mobx/utils/apiV2';
import WalletStore from './walletStore';
import Web3 from 'web3';
import { UserBalances } from 'mobx/model/account/user-balances';
import BigNumber from 'bignumber.js';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { GEYSER_ABI, ONE_MIN_MS } from 'config/constants';
import { UserBalanceCache } from 'mobx/model/account/user-balance-cache';
import { CachedUserBalances } from 'mobx/model/account/cached-user-balances';
import { VaultCaps } from 'mobx/model/vaults/vault-cap copy';
import { Account } from '../model/account/account';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { UserPermissions } from '../model/account/userPermissions';
import { NetworkStore } from './NetworkStore';

export default class UserStore {
	private store!: RootStore;
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
				const network = this.store.network.network;
				this.permissions = undefined;
				this.bouncerProof = undefined;
				this.accountDetails = undefined;
				if (address) {
					this.getSettShopEligibility(address);
					this.loadBouncerProof(address);
					this.loadAccountDetails(address, network.symbol);
					this.loadClaimProof(address);
					this.updateBalances(true);
				}
			}
		});

		/**
		 * Update account store on change of network.
		 */
		observe(this.store.network as NetworkStore, 'network', () => {
			if (!this.loadingBalances) {
				this.refreshBalances();
			}
		});
	}

	/* State Mutation Functions */

	refreshBalances(): void {
		this.updateBalances(true);
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

		const { network } = this.store.network;
		const { connectedAddress } = this.store.wallet;
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

	getTokenBalance(contract: string): TokenBalance {
		const tokenAddress = Web3.utils.toChecksumAddress(contract);
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
			const { connectedAddress, provider } = this.store.wallet;
			const { network } = this.store.network;
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

			const cacheKey = `${network.symbol}-${connectedAddress}`;
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
			const web3 = new Web3(this.store.wallet.provider);
			const geysers = batchRequests.flatMap((r) => r.addresses);
			const geyserBalances: UserBalances = {};
			await Promise.all(
				geysers.map(async (geyser) => {
					if (!geyser) {
						return;
					}
					const contract = new web3.eth.Contract(GEYSER_ABI, geyser);
					const staked = await contract.methods.totalStakedFor(this.store.wallet.connectedAddress).call();
					const vault = this.store.network.network.setts.find((s) => s.geyser && geyser);
					if (!vault) {
						return;
					}
					geyserBalances[geyser] = new TokenBalance(
						{ address: vault.vaultToken.address, decimals: 18 },
						new BigNumber(staked),
						new BigNumber(0),
					);
				}),
			);

			const vaultCaps = {};
			const tokenBalances: UserBalances = {};
			const settBalances: UserBalances = {};

			const result = {
				key: cacheKey,
				tokens: tokenBalances,
				setts: settBalances,
				geysers: geyserBalances,
				vaultCaps,
				expiry: Date.now() + 5 * ONE_MIN_MS,
			};
			console.log(result);
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
