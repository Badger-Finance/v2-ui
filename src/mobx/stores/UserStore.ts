import { Account, BouncerType, MerkleProof, Network, RewardTree, VaultDTO } from '@badger-dao/sdk';
import { BigNumber, ethers } from 'ethers';
import { action, extendObservable } from 'mobx';
import { UserBalanceCache } from 'mobx/model/account/user-balance-cache';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { VaultCaps } from 'mobx/model/vaults/vault-cap copy';

import { RootStore } from './RootStore';

export default class UserStore {
	private store: RootStore;
	private userBalanceCache: UserBalanceCache = {};

	// loading: undefined, error: null, present: object
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
			tokenBalances: this.tokenBalances,
			settBalances: this.settBalances,
			vaultCaps: this.vaultCaps,
			loadingBalances: this.loadingBalances,
		});
	}

	/* Read Variables */

	onGuestList(vault: VaultDTO): boolean {
		// allow users who are not connected to nicely view setts
		if (!this.store.wallet.isConnected) {
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

	get portfolioValue(): number {
		return this.walletValue + this.vaultValue;
	}

	get walletValue(): number {
		return Object.values(this.tokenBalances)
			.filter((t) => this.store.vaults.protocolTokens?.has(t.token.address))
			.reduce((total, token) => (total += token.value), 0);
	}

	get vaultValue(): number {
		return Object.values(this.settBalances).reduce((total, vault) => (total += vault.value), 0);
	}

	get initialized(): boolean {
		const { vaultMap } = this.store.vaults;

		// no data available
		if (!vaultMap) {
			return false;
		}

		// no products configured
		if (Object.keys(vaultMap).length === 0) {
			return true;
		}

		return !this.loadingBalances;
	}

	async reloadBalances(address?: string): Promise<void> {
		const { vaults, user, sdk } = this.store;
		const actions = [];
		const queryAddress = address ?? sdk.address;

		if (vaults.initialized && queryAddress) {
			actions.push(user.updateBalances());
			actions.push(user.loadAccountDetails(queryAddress));
			await Promise.all(actions);
		}
	}

	getBalance(contract: string): TokenBalance {
		const tokenAddress = ethers.utils.getAddress(contract);
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

	loadAccountDetails = action(async (address: string): Promise<void> => {
		const accountDetails = await this.store.sdk.api.loadAccount(address);
		if (accountDetails) {
			this.accountDetails = accountDetails;
		}
	});

	updateBalances = action(async (addressOverride?: string, cached?: boolean): Promise<void> => {
		const { network } = this.store.network;
		const {
			vaults,
			sdk: { provider, address },
		} = this.store;

		/**
		 * only allow one set of calls at a time, blocked by a loading guard
		 * do not update balances without prices available or a provider, price updates
		 * will trigger balance display updates
		 */
		const queryAddress = addressOverride ?? address;
		if (!queryAddress || !vaults.initialized || this.loadingBalances || !provider || !vaults.vaultMap) {
			return;
		}

		this.loadingBalances = true;

		const cacheKey = `${network.symbol}-${address}`;

		if (cached) {
			const cachedBalances = this.userBalanceCache[cacheKey];
			if (cachedBalances && Date.now() <= cachedBalances.expiry) {
				// this.setBalances(cachedBalances);
				this.loadingBalances = false;
				return;
			}
		}

		try {
			// 	const multicallContractAddress = getChainMulticallContract(network.symbol);
			// 	const multicallRequests = network.getBalancesRequests(
			// 		vaults.vaultMap,
			// 		vaults.getTokenConfigs(),
			// 		queryAddress,
			// 	);

			// 	let multicall;
			// 	let multicallResults;
			// 	try {
			// 		multicall = new Multicall({
			// 			web3Instance: web3Instance,
			// 			tryAggregate: true,
			// 			multicallCustomContractAddress: multicallContractAddress,
			// 		});
			// 		multicallResults = await multicall.call(multicallRequests);
			// 	} catch (err) {
			// 		console.error({
			// 			err,
			// 			message: `This error may be because MulticallV2 is not defined for ${network.name}.`,
			// 		});
			// 		multicall = new Multicall({
			// 			web3Instance: web3Instance,
			// 			multicallCustomContractAddress: multicallContractAddress,
			// 		});
			// 		multicallResults = await multicall.call(multicallRequests);
			// 	}

			// 	const requestResults = extractBalanceRequestResults(multicallResults);
			// 	const { tokenBalances, settBalances } = this.extractBalancesFromResults(requestResults);
			// 	const { guestLists, guestListLookup } = this.extractGuestListInformation(requestResults.userGuardedVaults);
			// 	const guestListRequests = createMulticallRequest(guestLists, ContractNamespaces.GuestList, queryAddress);
			// 	const guestListResults = await multicall.call(guestListRequests);
			// 	const vaultCaps = await this.getVaultCaps(guestListResults, guestListLookup);

			// 	const result = {
			// 		key: cacheKey,
			// 		tokens: tokenBalances,
			// 		setts: settBalances,
			// 		vaultCaps,
			// 		expiry: Date.now() + 5 * ONE_MIN_MS,
			// 	};

			// 	this.userBalanceCache[cacheKey] = result;
			// 	this.setBalances(result);

			this.loadingBalances = false;
		} catch (err) {
			console.error(err);
			this.loadingBalances = false;
		}
	});

	private getOrDefaultBalance(balances: TokenBalances, token: string): TokenBalance {
		const balance = balances[token];
		if (!balance) {
			return new TokenBalance(
				this.store.vaults.getToken(token),
				BigNumber.from(0),
				this.store.prices.getPrice(token),
			);
		}
		return balance;
	}
}
