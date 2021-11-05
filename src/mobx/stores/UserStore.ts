import { action, extendObservable, observe } from 'mobx';
import { RootStore } from '../RootStore';
import WalletStore from './walletStore';
import Web3 from 'web3';
import { ExtractedBalances, GuestListInformation, TokenBalances } from 'mobx/model/account/user-balances';
import BatchCall from 'web3-batch-call';
import { BatchCallClient } from 'web3/interface/batch-call-client';
import BigNumber from 'bignumber.js';
import { BalanceNamespace, ContractNamespaces } from 'web3/config/namespaces';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { BadgerSett } from 'mobx/model/vaults/badger-sett';
import { BadgerToken, mockToken } from 'mobx/model/tokens/badger-token';
import { ONE_MIN_MS, ZERO_ADDR } from 'config/constants';
import { UserBalanceCache } from 'mobx/model/account/user-balance-cache';
import { CachedTokenBalances } from 'mobx/model/account/cached-token-balances';
import { VaultCaps } from 'mobx/model/vaults/vault-cap copy';
import { RewardMerkleClaim } from '../model/rewards/reward-merkle-claim';
import { UserPermissions } from '../model/account/userPermissions';
import { NetworkStore } from './NetworkStore';
import { defaultSettBalance } from 'components-v2/sett-detail/utils';
import { getToken } from 'web3/config/token-config';
import { Account, BouncerType, MerkleProof, Network, Sett, SettData } from '@badger-dao/sdk';
import { fetchClaimProof } from 'mobx/utils/apiV2';
import { Multicall } from 'ethereum-multicall';
import { extractBalanceRequestResults, RequestExtractedResults } from '../utils/user-balances';
import { parseCallReturnContext } from '../utils/multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';
import { createMulticallRequest } from '../../web3/config/config-utils';
import { ContractCallResults } from 'ethereum-multicall/dist/esm/models';

export default class UserStore {
	private store: RootStore;
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
				web3: new Web3(provider),
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
		let hasGeysers;

		const { connectedAddress } = this.store.wallet;

		const geyserRequests = network
			.getBalancesRequests(settMap, connectedAddress)
			.find((req) => req.context.namespace === BalanceNamespace.Geyser);

		if (geyserRequests) {
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

	getBalance(namespace: BalanceNamespace, sett: BadgerSett): TokenBalance {
		switch (namespace) {
			case BalanceNamespace.Sett:
			case BalanceNamespace.GuardedSett:
				const settAddress = Web3.utils.toChecksumAddress(sett.vaultToken.address);
				return this.getOrDefaultBalance(this.settBalances, settAddress);
			case BalanceNamespace.Geyser:
				if (!sett.geyser) {
					throw new Error(`${sett.vaultToken.address} does not have a geyser`);
				}
				const geyserAdress = Web3.utils.toChecksumAddress(sett.geyser);
				return this.getOrDefaultBalance(this.geyserBalances, geyserAdress);
			case BalanceNamespace.Token:
			default:
				const tokenAddress = Web3.utils.toChecksumAddress(sett.depositToken.address);
				return this.getOrDefaultBalance(this.tokenBalances, tokenAddress);
		}
	}

	getTokenBalance(contract: string): TokenBalance {
		const tokenAddress = Web3.utils.toChecksumAddress(contract);
		const compositeBalances = {
			...this.settBalances,
			...this.geyserBalances,
			...this.tokenBalances,
		};
		return this.getOrDefaultBalance(compositeBalances, tokenAddress);
	}

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
			const proof = await fetchClaimProof(Web3.utils.toChecksumAddress(address), chain);
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

			const multicall = new Multicall({ web3Instance: new Web3(provider), tryAggregate: true });
			const multicallRequests = network.getBalancesRequests(setts.settMap, connectedAddress);
			const multicallResults = await multicall.call(multicallRequests);

			const requestResults = extractBalanceRequestResults(multicallResults);
			const { tokenBalances, settBalances, geyserBalances } = this.extractBalancesFromResults(requestResults);
			const { guestLists, guestListLookup } = this.extractGuestListInformation(requestResults.userGuardedSetts);

			const guestListRequests = createMulticallRequest(
				guestLists,
				ContractNamespaces.GuestList,
				connectedAddress,
			);

			const guestListResults = await multicall.call(guestListRequests);
			const vaultCaps = await this.getVaultCaps(guestListResults, guestListLookup);

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

	private getOrDefaultBalance(balances: TokenBalances, token: string): TokenBalance {
		const balance = balances[token];
		if (!balance) {
			return this.store.rewards.mockBalance(token);
		}
		return balance;
	}

	private extractBalancesFromResults({
		userTokens,
		userGeneralSetts,
		userGuardedSetts,
		userGeysers,
		nonSettUserTokens,
	}: RequestExtractedResults): ExtractedBalances {
		const tokenBalances: TokenBalances = {};
		const settBalances: TokenBalances = {};
		const geyserBalances: TokenBalances = {};

		userTokens.forEach((token) => this.updateUserBalance(tokenBalances, token, this.getDepositToken));
		userGeneralSetts.forEach((sett) => this.updateUserBalance(settBalances, sett, this.getSettToken));
		userGeneralSetts.forEach((sett) => this.store.setts.updateAvailableBalance(sett));
		userGuardedSetts.forEach((sett) => this.updateUserBalance(settBalances, sett, this.getSettToken));
		userGuardedSetts.forEach((sett) => this.store.setts.updateAvailableBalance(sett));
		userGeysers.forEach((geyser) => this.updateUserBalance(geyserBalances, geyser, this.getGeyserMockToken));
		nonSettUserTokens.forEach((token) => this.updateNonSettUserBalance(tokenBalances, token));

		return {
			tokenBalances,
			settBalances,
			geyserBalances,
		};
	}

	private setBalances = (balances: CachedTokenBalances): void => {
		const { tokens, setts, geysers, vaultCaps } = balances;
		this.tokenBalances = tokens;
		this.settBalances = setts;
		this.geyserBalances = geysers;
		this.vaultCaps = vaultCaps;
	};

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
			const vault = this.store.setts.getSett(vaultAddress);

			if (!vault) {
				continue;
			}

			const depositToken = this.store.setts.getToken(vault.underlyingToken);

			if (!depositToken) {
				continue;
			}

			const remainingTotalDepositAllowed = result.remainingTotalDepositAllowed[0].value;
			const totalDepositCap = result.totalDepositCap[0].value;
			const remainingUserDepositAllowed = result.remainingUserDepositAllowed[0].value;
			const userDepositCap = result.userDepositCap[0].value;

			vaultCaps[vault.settToken] = {
				vaultCap: this.store.rewards.balanceFromProof(depositToken.address, remainingTotalDepositAllowed),
				totalVaultCap: this.store.rewards.balanceFromProof(depositToken.address, totalDepositCap),
				userCap: this.store.rewards.balanceFromProof(depositToken.address, remainingUserDepositAllowed),
				totalUserCap: this.store.rewards.balanceFromProof(depositToken.address, userDepositCap),
				asset: depositToken.symbol,
			};
		}

		return vaultCaps;
	}

	private extractGuestListInformation(guardedSettsResult: ContractCallReturnContext[]): GuestListInformation {
		const guestListLookup: Record<string, string> = {};

		const guestLists = guardedSettsResult
			.map((returnContext) => {
				const settAddress = returnContext.originalContractCallContext.contractAddress;
				const sett = parseCallReturnContext(returnContext.callsReturnContext);

				if (!sett.guestList || sett.guestList.length === 0) {
					return;
				}

				const guestList = sett.guestList[0];

				if (guestList === ZERO_ADDR) {
					return;
				}

				guestListLookup[guestList] = settAddress;

				return guestList;
			})
			.filter(Boolean);

		return { guestLists, guestListLookup };
	}

	/* Update Balance Helpers */

	private updateUserBalance = (
		tokenBalances: TokenBalances,
		returnContext: ContractCallReturnContext,
		getBalanceToken: (sett: BadgerSett) => BadgerToken,
	): void => {
		const {
			prices,
			network: { network },
		} = this.store;

		const tokenAddress = returnContext.originalContractCallContext.contractAddress;
		const token = parseCallReturnContext(returnContext.callsReturnContext);
		const balanceResults = token.balanceOf || token.totalStakedFor;

		if (!balanceResults || balanceResults.length === 0) {
			return;
		}

		const balance = new BigNumber(balanceResults[0].hex);
		const sett = network.setts.find((s) => getBalanceToken(s).address === tokenAddress);

		if (!sett) {
			return;
		}

		const balanceToken = getBalanceToken(sett);
		let pricingToken = balanceToken.address;

		if (sett.geyser && sett.geyser === pricingToken) {
			pricingToken = sett.vaultToken.address;
		}

		const tokenPrice = prices.getPrice(pricingToken);
		const key = Web3.utils.toChecksumAddress(balanceToken.address);

		tokenBalances[key] = new TokenBalance(balanceToken, balance, tokenPrice);
	};

	private updateNonSettUserBalance = (
		tokenBalances: TokenBalances,
		returnContext: ContractCallReturnContext,
	): void => {
		const { prices } = this.store;
		const tokenAddress = returnContext.originalContractCallContext.contractAddress;
		const token = parseCallReturnContext(returnContext.callsReturnContext);
		const balanceResults = token.balanceOf;

		if (!balanceResults || balanceResults.length === 0 || !tokenAddress) {
			return;
		}

		const balanceToken = getToken(tokenAddress);

		if (!balanceToken) {
			return;
		}

		const balance = new BigNumber(balanceResults[0].hex);
		const tokenPrice = prices.getPrice(tokenAddress);
		const key = Web3.utils.toChecksumAddress(tokenAddress);
		tokenBalances[key] = new TokenBalance(balanceToken, balance, tokenPrice);
	};

	/* Token Balance Accessors */

	private getDepositToken = (sett: BadgerSett): BadgerToken => sett.depositToken; //.Token
	private getSettToken = (sett: BadgerSett): BadgerToken => sett.vaultToken; //.Sett, .GuardedSett
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
	private getGeyserMockToken = (sett: BadgerSett): BadgerToken => mockToken(sett.geyser!, sett.vaultToken.decimals);
}
