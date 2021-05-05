import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../store';
import { UserPermissions, Account, RewardMerkleClaim } from 'mobx/model';
import { checkShopEligibility, fetchBouncerProof, fetchClaimProof, getAccountDetails } from 'mobx/utils/apiV2';
import WalletStore from './walletStore';
import Web3 from 'web3';

/**
 * TODO: Aggregation of user specific information will move here.
 * This includes:
 *   - rewards claim proofs
 *   - airdrop claim proofs
 *   - yearn bouncer proofs
 *   - sett shop eligibility
 * We can eventually merge this with disjoint pieces of the wallet
 * store once pieces have been incorporated into the @see {User}
 * model to support wallet features, etc.
 */
export default class UserStore {
	private store!: RootStore;

	// loading: undefined, error: null, present: object
	private permissions: UserPermissions | undefined | null;
	public claimProof: RewardMerkleClaim | undefined | null;
	public bouncerProof: string[] | undefined | null;
	public accountDetails: Account | undefined | null;

	constructor(store: RootStore) {
		this.store = store;
		this.permissions = undefined;
		this.bouncerProof = undefined;
		this.accountDetails = undefined;

		extendObservable(this, {
			permissions: this.permissions,
			bouncerProof: this.bouncerProof,
			viewSettShop: this.viewSettShop,
			accountDetails: this.accountDetails,
			claimProof: this.claimProof,
		});

		/**
		 * TODO: Update with a full user address data update on change.
		 */
		observe(this.store.wallet as WalletStore, 'connectedAddress', () => {
			const address = this.store.wallet.connectedAddress;
			const network = this.store.wallet.network;
			if (address) {
				this.getSettShopEligibility(address);
				this.loadBouncerProof(address);
				this.loadAccountDetails(address, network.name);
				this.loadClaimProof(address);
			}
		});
	}

	viewSettShop(): boolean {
		if (!this.permissions) return false;
		return this.permissions.viewSettShop;
	}

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
