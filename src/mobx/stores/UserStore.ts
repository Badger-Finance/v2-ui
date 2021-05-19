import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../store';
import { UserPermissions, Account, RewardMerkleClaim, Network } from 'mobx/model';
import { checkShopEligibility, fetchBouncerProof, fetchClaimProof, getAccountDetails } from 'mobx/utils/apiV2';
import WalletStore from './walletStore';
import Web3 from 'web3';
import { UserBalances } from 'mobx/model/user-balances';
import BatchCall from 'web3-batch-call';
import { BatchCallClient } from 'web3/interface/batch-call-client';
import BigNumber from 'bignumber.js';
import { ContractNamespace } from 'web3/config/contract-namespace';
import { TokenBalance } from 'mobx/model/token-balance';
import { BadgerSett } from 'mobx/model/badger-sett';
import { BadgerToken, mockToken } from 'mobx/model/badger-token';
import { CallResult } from 'web3/interface/call-result';
import { DEBUG } from 'config/constants';

export default class UserStore {
	private store!: RootStore;
	private batchCall: BatchCallClient;

	// loading: undefined, error: null, present: object
	private permissions: UserPermissions | undefined | null;
	public claimProof: RewardMerkleClaim | undefined | null;
	public bouncerProof: string[] | undefined | null;
	public accountDetails: Account | undefined | null;
	public tokenBalances: UserBalances = {};
	public settBalances: UserBalances = {};
	public geyserBalances: UserBalances = {};
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
			loadingBalances: this.loadingBalances,
		});

		/**
		 * Update user store on change of address.
		 */
		observe(this.store.wallet as WalletStore, 'connectedAddress', () => {
			const address = this.store.wallet.connectedAddress;
			const network = this.store.wallet.network;
			if (address) {
				this.init(address, network);
			} else {
				this.reset(true);
			}
		});

		/**
		 * Update user store on change of network.
		 */
		observe(this.store.wallet as WalletStore, 'network', () => {
			this.updateProvider();
			this.reset();
		});
	}

	/* State Mutation Functions */

	private init = action((address: string, network: Network): void => {
		this.getSettShopEligibility(address);
		this.loadBouncerProof(address);
		this.loadAccountDetails(address, network.name);
		this.loadClaimProof(address);
		this.updateProvider();
	});

	private reset = action((hardReset?: boolean): void => {
		this.tokenBalances = {};
		this.settBalances = {};
		this.geyserBalances = {};
		this.loadingBalances = true;
		if (hardReset) {
			this.permissions = undefined;
			this.bouncerProof = undefined;
			this.accountDetails = undefined;
		}
	});

	private updateProvider(): void {
		const provider = this.store.wallet.provider;
		if (provider) {
			const newOptions = {
				web3: new Web3(this.store.wallet.provider),
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

	portfolioValue(): BigNumber {
		return this.walletValue().plus(this.settValue()).plus(this.geyserValue());
	}

	walletValue(): BigNumber {
		return Object.values(this.tokenBalances).reduce((total, token) => total.plus(token.value), new BigNumber(0));
	}

	settValue(): BigNumber {
		return Object.values(this.settBalances).reduce((total, sett) => total.plus(sett.value), new BigNumber(0));
	}

	geyserValue(): BigNumber {
		return Object.values(this.geyserBalances).reduce((total, geyser) => total.plus(geyser.value), new BigNumber(0));
	}

	getBalance(namespace: ContractNamespace, sett: BadgerSett): TokenBalance {
		switch (namespace) {
			case ContractNamespace.Sett:
				const settAddress = Web3.utils.toChecksumAddress(sett.vaultToken.address);
				return this.settBalances[settAddress];
			case ContractNamespace.Geyser:
				if (!sett.geyser) {
					throw new Error(`${sett.vaultToken.address} does not have a geyser`);
				}
				const geyserAdress = Web3.utils.toChecksumAddress(sett.geyser);
				return this.geyserBalances[geyserAdress];
			case ContractNamespace.Token:
			default:
				const tokenAddress = Web3.utils.toChecksumAddress(sett.depositToken.address);
				return this.tokenBalances[tokenAddress];
		}
	}

	updateBalances = action(
		async (): Promise<void> => {
			const { connectedAddress, network } = this.store.wallet;

			if (!this.loadingBalances) {
				this.loadingBalances = true;
			}

			// construct & execute batch requests
			const batchRequests = network.batchRequests(connectedAddress);

			if (!batchRequests || batchRequests.length === 0) {
				return;
			}

			const callResults: CallResult[] = await this.batchCall.execute(batchRequests);
			if (DEBUG) {
				console.log({ network: network.name, callResults });
			}

			// filter batch requests by namespace
			const userTokens = callResults.filter((result) => result.namespace === ContractNamespace.Token);
			const userSetts = callResults.filter((result) => result.namespace === ContractNamespace.Sett);
			const userGeysers = callResults.filter((result) => result.namespace === ContractNamespace.Geyser);

			// update all user balances
			userTokens.forEach((token) => this.updateUserBalance(this.tokenBalances, token, this.getDepositToken));
			userSetts.forEach((sett) => this.updateUserBalance(this.settBalances, sett, this.getSettToken));
			userGeysers.forEach((geyser) =>
				this.updateUserBalance(this.geyserBalances, geyser, this.getGeyserMockToken),
			);

			// fill in zero balances for user for all setts / geysers they are not a part of
			const [tokens, setts, geysers] = batchRequests;
			if (tokens.addresses) {
				tokens.addresses
					.map((sett) => Web3.utils.toChecksumAddress(sett))
					.filter((token) => !Object.keys(this.tokenBalances).includes(token))
					.forEach((token) => this.updateZeroBalance(this.tokenBalances, token, this.getDepositToken));
			}
			if (setts.addresses) {
				setts.addresses
					.map((sett) => Web3.utils.toChecksumAddress(sett))
					.filter((sett) => !Object.keys(this.settBalances).includes(sett))
					.forEach((sett) => this.updateZeroBalance(this.settBalances, sett, this.getSettToken));
			}
			if (geysers.addresses) {
				geysers.addresses
					.map((sett) => Web3.utils.toChecksumAddress(sett))
					.filter((geyser) => !Object.keys(this.geyserBalances).includes(geyser))
					.forEach((geyser) => this.updateZeroBalance(this.geyserBalances, geyser, this.getGeyserMockToken));
			}

			this.loadingBalances = false;
		},
	);

	/* Update Balance Helpers */

	private updateUserBalance = (
		userBalances: UserBalances,
		token: CallResult,
		getToken: (sett: BadgerSett) => BadgerToken,
	): void => {
		const { setts, wallet, rewards } = this.store;
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
		const tokenPrice = setts.getPrice(pricingToken);
		const key = Web3.utils.toChecksumAddress(balanceToken.address);
		userBalances[key] = new TokenBalance(rewards, balanceToken, balance, tokenPrice);
	};

	private updateZeroBalance = (
		userBalances: UserBalances,
		token: string,
		getToken: (sett: BadgerSett) => BadgerToken,
	): void => {
		const { wallet, rewards } = this.store;
		const { network } = wallet;
		const balance = new BigNumber(0);
		const sett = network.setts.find((sett) => getToken(sett).address === token);
		if (!sett) {
			return;
		}
		const balanceToken = getToken(sett);
		const tokenPrice = new BigNumber(0);
		const key = Web3.utils.toChecksumAddress(balanceToken.address);
		userBalances[key] = new TokenBalance(rewards, balanceToken, balance, tokenPrice);
	};

	/* Token Balance Accessors */

	private getDepositToken = (sett: BadgerSett): BadgerToken => sett.depositToken;
	private getSettToken = (sett: BadgerSett): BadgerToken => sett.vaultToken;
	/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
	private getGeyserMockToken = (sett: BadgerSett): BadgerToken => mockToken(sett.geyser!);

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
				this.store.rewards.fetchSettRewards();
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
