import { extendObservable, action, observe } from 'mobx';
import { RootStore } from '../RootStore';
import { reduceClaims, reduceTimeSinceLastCycle } from 'mobx/reducers/statsReducers';
import { getSendOptions, sendContractMethod } from 'mobx/utils/web3';
import { getToken } from '../../web3/config/token-config';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { mockToken } from 'mobx/model/tokens/badger-token';
import { ClaimMap } from 'components-v2/landing/RewardsModal';
import { BadgerTree } from '../model/rewards/badger-tree';
import { TreeClaimData } from '../model/rewards/tree-claim-data';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { retry } from '@lifeomic/attempt';
import { defaultRetryOptions } from '../../config/constants';
import { Network } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { BadgerTree__factory } from 'contracts';

/**
 * TODO: Clean up reward store in favor of a more unified integration w/ account store.
 * Create a more generalized ProtocolStore - holding token information surrounding Badger.
 *
 * i.e.
 *   - Digg information (sharesPerFragment, rebase data etc.)
 *   - Badger tree information (current cycle, time since last cycle)
 *   - Token information (token symbol, decimals, name)
 *   - etc.
 *
 * This may overlap some with RebaseStore - this would be a good opporunity to rewrite that
 * store to achieve:
 *   - more readble code
 *   - more unified data processing
 *
 * This may involve creating a more generalized way of handling web3 providers and batch call.
 * Currently, batch call is used in multiple stores - ideally this could be routed via single web3
 * provider, or batch call object to standardize configurations.
 */
class RewardsStore {
	private store!: RootStore;
	private static defaultTree: BadgerTree = {
		cycle: '...',
		lastCycle: new Date(),
		timeSinceLastCycle: '0h 0m',
		proof: undefined,
		claimableAmounts: [],
		claims: [],
		amounts: [],
	};
	public badgerTree: BadgerTree;
	public loadingRewards: boolean;
	public loadingTreeData: boolean;

	constructor(store: RootStore) {
		this.store = store;
		this.badgerTree = RewardsStore.defaultTree;
		this.loadingTreeData = false;
		this.loadingRewards = false;

		extendObservable(this, {
			badgerTree: this.badgerTree,
			loadingTreeData: this.loadingTreeData,
			loadingRewards: this.loadingRewards,
		});

		observe(this.store.network, 'network', () => {
			this.resetRewards();
		});
	}

	get isLoading(): boolean {
		return this.loadingTreeData || this.loadingRewards;
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromString(token: string, balance: string): TokenBalance {
		const badgerToken = getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);
		if (!badgerToken || !tokenPrice) {
			const amount = BigNumber.from(balance);
			return new TokenBalance(mockToken(token), amount, BigNumber.from(0));
		}
		const scalar = BigNumber.from(Math.pow(10, badgerToken.decimals));
		const amount = BigNumber.from(balance).mul(scalar);
		return new TokenBalance(badgerToken, amount, tokenPrice);
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromProof(token: string, balance: string): TokenBalance {
		const { rebase: rebaseInfo } = this.store.rebase;
		const claimToken = getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);

		if (!claimToken || !tokenPrice) {
			const amount = BigNumber.from(balance);
			return new TokenBalance(mockToken(token), amount, BigNumber.from(0));
		}

		const isDigg = claimToken.address === ETH_DEPLOY.tokens.digg;
		const divisor = isDigg && rebaseInfo ? rebaseInfo.sharesPerFragment : BigNumber.from(1);

		const amount = BigNumber.from(balance).div(divisor);
		return new TokenBalance(claimToken, amount, tokenPrice);
	}
	mockBalance(token: string): TokenBalance {
		return this.balanceFromString(token, '0');
	}

	resetRewards = action((): void => {
		this.badgerTree.claimableAmounts = [];
		this.badgerTree.claims = [];
		this.badgerTree.amounts = [];
		this.badgerTree.proof = undefined;
		this.loadingRewards = false;
	});

	loadTreeData = action(
		async (): Promise<void> => {
			const {
				network: { network },
				uiState: { queueNotification },
				wallet: { provider },
			} = this.store;

			if (this.loadingTreeData) {
				return;
			}

			if (!network.badgerTree) {
				console.error('Error: No badger tree address was found in current network deploy config');
				return;
			}

			this.loadingTreeData = true;
			const badgerTree = BadgerTree__factory.connect(network.badgerTree, provider);

			try {
				const [timestamp, cycle] = await Promise.all([
					badgerTree.lastPublishTimestamp(),
					badgerTree.currentCycle(),
				]);
				const timestampSeconds = timestamp.toNumber();
				this.badgerTree.lastCycle = new Date(timestampSeconds * 1000);
				this.badgerTree.cycle = cycle.toString();
				this.badgerTree.timeSinceLastCycle = reduceTimeSinceLastCycle(timestampSeconds);

				await retry(() => this.fetchSettRewards(), defaultRetryOptions);
			} catch (error) {
				console.error('There was an error fetching rewards information: ', error);
				queueNotification(
					`Error retrieving rewards information, please refresh the page or check your web3 provider.`,
					'error',
				);
			}

			this.loadingTreeData = false;
		},
	);

	fetchSettRewards = action(
		async (): Promise<void> => {
			const {
				network: { network },
				prices: { arePricesAvailable },
				user: { claimProof },
				wallet: { connectedAddress, provider },
			} = this.store;

			if (this.loadingRewards) {
				return;
			}

			if (!network.badgerTree) {
				console.error('Error: No badger tree address was found in current network deploy config');
				return;
			}

			if (!connectedAddress || !claimProof) {
				this.resetRewards();
				return;
			}

			// when prices aren't available the claim balances will be zero even if the account has unclaimed rewards
			if (!arePricesAvailable) {
				throw new Error('Error: Prices are not available for current network');
			}

			this.loadingRewards = true;
			const badgerTree = BadgerTree__factory.connect(network.badgerTree, provider);
			const claimed: TreeClaimData = await badgerTree.getClaimedFor(connectedAddress, claimProof.tokens);

			this.badgerTree.claimableAmounts = claimProof.cumulativeAmounts;
			this.badgerTree.claims = reduceClaims(claimProof, claimed, true);
			this.badgerTree.amounts = reduceClaims(claimProof, claimed);
			this.badgerTree.proof = claimProof;

			this.loadingRewards = false;
		},
	);

	claimGeysers = action(
		async (claimMap: ClaimMap): Promise<void> => {
			const { proof, amounts } = this.badgerTree;
			const { provider, connectedAddress } = this.store.wallet;
			const { queueNotification, gasPrice } = this.store.uiState;
			const { gasPrices, network } = this.store.network;
			const { rebase } = this.store.rebase;

			if (!connectedAddress) {
				return;
			}

			let sharesPerFragment = BigNumber.from(1);
			if (network.symbol === Network.Ethereum && !rebase) {
				return;
			} else if (rebase) {
				sharesPerFragment = rebase.sharesPerFragment;
			}

			if (!proof || !claimMap) {
				queueNotification(`Error retrieving reward data.`, 'error');
				return;
			}

			const amountsToClaim: string[] = [];
			proof.tokens.forEach((address: string, index: number): void => {
				const token = getToken(address);
				if (!token) {
					return;
				}

				const claimEntry = claimMap[token.address];
				const claimableAmount = amounts[index].tokenBalance;
				let claimBalance;

				if (claimEntry) {
					claimBalance = claimEntry.balance.tokenBalance;
				} else {
					claimBalance = this.mockBalance(token.address).tokenBalance;
				}

				let claimAmount = claimBalance;
				if (token.address === ETH_DEPLOY.tokens.digg) {
					claimBalance = claimBalance
						.mul(Math.pow(10, token.decimals))
						.mul(sharesPerFragment);
				}

				if (claimBalance.gt(claimableAmount)) {
					claimAmount = claimableAmount;
				}
				amountsToClaim.push(claimAmount.toHexString());
			});

			if (amountsToClaim.length < proof.tokens.length) {
				queueNotification(`Error retrieving tokens for claiming.`, 'error');
				return;
			}

			const badgerTree = BadgerTree__factory.connect(network.badgerTree, provider);
			const method = badgerTree.claim(
				proof.tokens,
				proof.cumulativeAmounts,
				proof.index,
				proof.cycle,
				proof.proof,
				amountsToClaim,
			);

			queueNotification(`Sign the transaction to claim your earnings`, 'info');

			const price = gasPrices ? gasPrices[gasPrice] : 0;
			const options = await getSendOptions(method, connectedAddress, price);
			await sendContractMethod(this.store, method, options, `Claim submitted.`, `Rewards claimed.`);
		},
	);
}

export default RewardsStore;
