import { action, extendObservable, observe } from 'mobx';
import { RootStore } from '../RootStore';
import WalletStore from './walletStore';
import { TokenBalances } from 'mobx/model/account/user-balances';
import BatchCall from 'web3-batch-call';
import { BatchCallClient } from 'web3/interface/batch-call-client';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { BadgerToken, mockToken } from 'mobx/model/tokens/badger-token';
import { CallResult } from 'web3/interface/call-result';
import { ONE_MIN_MS, ZERO, ZERO_ADDR } from 'config/constants';
import { UserBalanceCache } from 'mobx/model/account/user-balance-cache';
import { CachedTokenBalances } from 'mobx/model/account/cached-token-balances';
import { createBatchCallRequest } from 'web3/config/config-utils';
import { VaultCaps } from 'mobx/model/vaults/vault-cap copy';
import { VaultCap } from 'mobx/model/vaults/vault-cap';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { UserPermissions } from '../model/account/userPermissions';
import { NetworkStore } from './NetworkStore';
import { DEBUG } from 'config/environment';
import { defaultSettBalance } from 'components-v2/sett-detail/utils';
import { getToken } from 'web3/config/token-config';
import { Account, BouncerType, MerkleProof, Network, Sett, SettData } from '@badger-dao/sdk';
import { fetchClaimProof } from 'mobx/utils/apiV2';
import { BigNumber, ethers } from 'ethers';

export default class UserStore {
	private store!: RootStore;
	private batchCall: BatchCallClient;
	private userBalanceCache: UserBalanceCache = {};

	// loading: undefined, error: null, present: object
	public permissions: UserPermissions | undefined | null;
	public claimProof: RewardMerkleClaim | undefined | null;
	public bouncerProof: MerkleProof | undefined | null;
	public accountDetails: Account | undefined | null;
	public tokenBalances: TokenBalances = {};
	public settBalances: TokenBalances = {};
	public geyserBalances: TokenBalances = {};
	public vaultCaps: VaultCaps = {};
	public loadingBalances: boolean;

	constructor(store: RootStore) {
		this.store = store;
		this.batchCall = new BatchCall({ web3: this.store.wallet.rpcProvider ?? this.store.wallet.provider });
		this.loadingBalances = false;

		extendObservable(this, {
			permissions: this.permissions,
			bouncerProof: this.bouncerProof,
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
		observe(this.store.wallet as WalletStore, 'connectedAddress', async () => {
			if (!this.loadingBalances) {
				const address = this.store.wallet.connectedAddress;
				const network = this.store.network.network;
				this.permissions = undefined;
				this.bouncerProof = undefined;
				this.accountDetails = undefined;
				if (address) {
					await Promise.all([
						this.loadBouncerProof(address),
						this.loadAccountDetails(address),
						this.loadClaimProof(address, network.symbol),
						this.updateBalances(true),
					]);
				}
			}
		});

		/**
		 * Update account store on change of network.
		 */
		observe(this.store.network as NetworkStore, 'network', async () => {
			const address = this.store.wallet.connectedAddress;
			const network = this.store.network.network;

			if (!this.loadingBalances) {
				await this.refreshBalances();
			}

			if (address) {
				await this.loadClaimProof(address, network.symbol);
			}
		});
	}

	/* State Mutation Functions */

	async refreshBalances(): Promise<void> {
		this.refreshProvider();
		await this.updateBalances(true);
	}

	refreshProvider(): void {
		const provider = this.store.wallet.rpcProvider ?? this.store.wallet.provider;
		if (provider) {
			const newOptions = {
				web3: new ethers.providers.Web3Provider(provider),
			};
			this.batchCall = new BatchCall(newOptions);
		}
	}

	/* Read Variables */

	onGuestList(sett: Sett): boolean {
		// allow users who are not connected to nicely view setts
		if (!this.store.wallet.connectedAddress) {
			return true;
		}
		if (sett.bouncer === BouncerType.Internal) {
			return false;
		}
		if (sett.bouncer === BouncerType.None) {
			return true;
		}
		return !!this.bouncerProof && this.bouncerProof.length > 0;
	}

	get portfolioValue(): BigNumber {
		return this.walletValue.add(this.settValue).add(this.geyserValue);
	}

	get walletValue(): BigNumber {
		return Object.values(this.tokenBalances).reduce((total, token) => total.add(token.value), ZERO);
	}

	get settValue(): BigNumber {
		return Object.values(this.settBalances).reduce((total, sett) => total.add(sett.value), ZERO);
	}

	get geyserValue(): BigNumber {
		return Object.values(this.geyserBalances).reduce((total, geyser) => total.add(geyser.value), ZERO);
	}

	get initialized(): boolean {
		const { settMap } = this.store.setts;
		const { network } = this.store.network;

		// no data available
		if (!settMap) {
			return false;
		}

		// no products configured
		if (this.store.network.network.setts.length === 0) {
			return true;
		}

		const hasTokens = Object.keys(this.tokenBalances).length > 0;
		const hasSetts = Object.keys(this.settBalances).length > 0;
		let hasGeysers = false;

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

	async reloadBalances(): Promise<void> {
		const { user, wallet } = this.store;
		const actions = [];

		actions.push(user.updateBalances());

		if (wallet.connectedAddress) {
			actions.push(user.loadAccountDetails(wallet.connectedAddress));
		}

		await Promise.all(actions);
	}

	getSettBalance(sett: Sett): SettData {
		const currentSettBalance = this.getTokenBalance(sett.settToken);
		let settBalance = this.accountDetails?.data[sett.settToken];

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
			settBalance = defaultSettBalance(sett);
			settBalance.balance = currentSettBalance.balance.toNumber() * sett.pricePerFullShare;
		}

		return settBalance;
	}

	getBalance(namespace: ContractNamespace, sett: BadgerSett): TokenBalance {
		switch (namespace) {
			case ContractNamespace.Sett:
			case ContractNamespace.GaurdedSett:
				const settAddress = ethers.utils.getAddress(sett.vaultToken.address);
				return this.getOrDefaultBalance(this.settBalances, settAddress);
			case ContractNamespace.Geyser:
				if (!sett.geyser) {
					throw new Error(`${sett.vaultToken.address} does not have a geyser`);
				}
				const geyserAdress = ethers.utils.getAddress(sett.geyser);
				return this.getOrDefaultBalance(this.geyserBalances, geyserAdress);
			case ContractNamespace.Token:
			default:
				const tokenAddress = ethers.utils.getAddress(sett.depositToken.address);
				return this.getOrDefaultBalance(this.tokenBalances, tokenAddress);
		}
	}

	getTokenBalance(contract: string): TokenBalance {
		const tokenAddress = ethers.utils.getAddress(contract);
		const compositeBalances = {
			...this.settBalances,
			...this.geyserBalances,
			...this.tokenBalances,
		};
		return this.getOrDefaultBalance(compositeBalances, tokenAddress);
	}

	private getOrDefaultBalance(balances: TokenBalances, token: string): TokenBalance {
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
			const callResults: CallResult[] = await this.batchCall.execute(batchRequests);
			if (DEBUG) {
				console.log({ network: network.symbol, callResults });
			}

			// filter batch requests by namespace
			const userTokens = callResults.filter((result) => result.namespace === ContractNamespace.Token);
			const nonSettUserTokens = callResults.filter(
				(result) => result.namespace === ContractNamespace.NonSettToken,
			);
			const userGeneralSetts = callResults.filter((result) => result.namespace === ContractNamespace.Sett);
			const userGuardedSetts = callResults.filter((result) => result.namespace === ContractNamespace.GaurdedSett);
			const userGeysers = callResults.filter((result) => result.namespace === ContractNamespace.Geyser);

			const tokenBalances: TokenBalances = {};
			const settBalances: TokenBalances = {};
			const geyserBalances: TokenBalances = {};

			// update all account balances
			userTokens.forEach((token) => this.updateUserBalance(tokenBalances, token, this.getDepositToken));
			userGeneralSetts.forEach((sett) => this.updateUserBalance(settBalances, sett, this.getSettToken));
			userGeneralSetts.forEach((sett) => this.store.setts.updateAvailableBalance(sett));
			userGuardedSetts.forEach((sett) => this.updateUserBalance(settBalances, sett, this.getSettToken));
			userGuardedSetts.forEach((sett) => this.store.setts.updateAvailableBalance(sett));
			userGeysers.forEach((geyser) => this.updateUserBalance(geyserBalances, geyser, this.getGeyserMockToken));
			nonSettUserTokens.forEach((token) => this.updateNonSettUserBalance(tokenBalances, token));

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
						return [vault.settToken, cap];
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

	private setBalances = (balances: CachedTokenBalances): void => {
		const { tokens, setts, geysers, vaultCaps } = balances;
		this.tokenBalances = tokens;
		this.settBalances = setts;
		this.geyserBalances = geysers;
		this.vaultCaps = vaultCaps;
	};

	/* Update Balance Helpers */

	private updateUserBalance = (
		tokenBalances: TokenBalances,
		token: CallResult,
		getBalanceToken: (sett: BadgerSett) => BadgerToken,
	): void => {
		const {
			prices,
			network: { network },
		} = this.store;
		const balanceResults = token.balanceOf || token.totalStakedFor;
		if (!balanceResults || balanceResults.length === 0) {
			return;
		}
		const balance = BigNumber.from(balanceResults[0].value);
		const sett = network.setts.find((s) => getBalanceToken(s).address === token.address);
		if (!sett) {
			return;
		}
		const balanceToken = getBalanceToken(sett);
		let pricingToken = balanceToken.address;
		if (sett.geyser && sett.geyser === pricingToken) {
			pricingToken = sett.vaultToken.address;
		}
		const tokenPrice = prices.getPrice(pricingToken);
		const key = ethers.utils.getAddress(balanceToken.address);
		tokenBalances[key] = new TokenBalance(balanceToken, balance, tokenPrice);
	};

	private updateNonSettUserBalance = (tokenBalances: TokenBalances, token: CallResult): void => {
		const { prices } = this.store;
		const balanceResults = token.balanceOf;
		const tokenAddress = token.address;
		if (!balanceResults || balanceResults.length === 0 || !tokenAddress) {
			return;
		}
		const balanceToken = getToken(tokenAddress);
		if (!balanceToken) {
			return;
		}
		const balance = BigNumber.from(balanceResults[0].value);
		const tokenPrice = prices.getPrice(tokenAddress);
		const key = ethers.utils.getAddress(tokenAddress);
		tokenBalances[key] = new TokenBalance(balanceToken, balance, tokenPrice);
	};

	/* Token Balance Accessors */

	private getDepositToken = (sett: BadgerSett): BadgerToken => sett.depositToken;
	private getSettToken = (sett: BadgerSett): BadgerToken => sett.vaultToken;
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
	private getGeyserMockToken = (sett: BadgerSett): BadgerToken => mockToken(sett.geyser!, sett.vaultToken.decimals);

	/* User Data Retrieval */

	loadBouncerProof = action(
		async (address: string): Promise<void> => {
			try {
				const proof = await this.store.api.loadProof(address);
				if (proof) {
					this.bouncerProof = proof;
				}
			} catch {} // ignore non 200 responses
		},
	);

	loadClaimProof = action(
		async (address: string, chain = Network.Ethereum): Promise<void> => {
			const proof = await fetchClaimProof(ethers.utils.getAddress(address), chain);
			if (proof) {
				this.claimProof = proof;
				await this.store.rewards.fetchSettRewards();
			} else {
				this.claimProof = undefined;
			}
		},
	);

	loadAccountDetails = action(
		async (address: string): Promise<void> => {
			const accountDetails = await this.store.api.loadAccount(address);
			if (accountDetails) {
				this.accountDetails = accountDetails;
			}
		},
	);
}
