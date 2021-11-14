import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { RootStore } from '../RootStore';
import { abi as rewardsAbi } from '../../config/system/abis/BadgerTree.json';
import BigNumber from 'bignumber.js';
import { reduceClaims, reduceTimeSinceLastCycle } from 'mobx/reducers/statsReducers';
import { getSendOptions, sendContractMethod } from 'mobx/utils/web3';
import { getToken } from '../../web3/config/token-config';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { ClaimMap } from 'components-v2/landing/RewardsWidget';
import { BadgerTree } from '../model/rewards/badger-tree';
import { TreeClaimData } from '../model/rewards/tree-claim-data';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { retry } from '@lifeomic/attempt';
import { defaultRetryOptions } from '../../config/constants';
import { GasSpeed, Network } from '@badger-dao/sdk';

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
	}

	get isLoading(): boolean {
		return this.loadingTreeData || this.loadingRewards;
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromString(token: string, balance: string): TokenBalance {
		const badgerToken = this.store.setts.getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);
		if (!tokenPrice) {
			const amount = new BigNumber(balance);
			return new TokenBalance(badgerToken, amount, new BigNumber(0));
		}
		const scalar = new BigNumber(Math.pow(10, badgerToken.decimals));
		const amount = new BigNumber(balance).multipliedBy(scalar);
		return new TokenBalance(badgerToken, amount, tokenPrice);
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromProof(token: string, balance: string): TokenBalance {
		const { rebase: rebaseInfo } = this.store.rebase;
		const claimToken = this.store.setts.getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);

		if (!tokenPrice) {
			const amount = new BigNumber(balance);
			return new TokenBalance(claimToken, amount, new BigNumber(0));
		}

		const isDigg = claimToken.address === ETH_DEPLOY.tokens.digg;
		const divisor = isDigg && rebaseInfo ? rebaseInfo.sharesPerFragment : new BigNumber(1);

		const amount = new BigNumber(balance).dividedBy(divisor);
		return new TokenBalance(claimToken, amount, tokenPrice);
	}
	mockBalance(token: string): TokenBalance {
		return new TokenBalance(
			{
				name: '',
				symbol: '',
				decimals: 18,
				address: token,
			},
			new BigNumber(0),
			new BigNumber(0),
		);
	}

	resetRewards = action((): void => {
		this.badgerTree.claimableAmounts = [];
		this.badgerTree.claims = [];
		this.badgerTree.amounts = [];
		this.badgerTree.proof = undefined;
		this.loadingRewards = false;
		this.store.user.claimProof = undefined;
	});

	loadTreeData = action(
		async (): Promise<void> => {
			const {
				network: { network },
				uiState: { queueNotification },
				onboard: { wallet },
			} = this.store;

			if (this.loadingTreeData) {
				return;
			}

			if (!network.badgerTree) {
				console.error('Error: No badger tree address was found in current network deploy config');
				return;
			}

			this.loadingTreeData = true;

			const web3 = new Web3(wallet?.provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], network.badgerTree);

			try {
				const [timestamp, cycle]: [number, number] = await Promise.all([
					rewardsTree.methods.lastPublishTimestamp().call(),
					rewardsTree.methods.currentCycle().call(),
				]);
				this.badgerTree.lastCycle = new Date(timestamp * 1000);
				this.badgerTree.cycle = cycle.toString();
				this.badgerTree.timeSinceLastCycle = reduceTimeSinceLastCycle(timestamp);

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
				onboard: { wallet, address },
			} = this.store;

			if (this.loadingRewards) {
				return;
			}

			if (!network.badgerTree) {
				console.error('Error: No badger tree address was found in current network deploy config');
				return;
			}

			if (!address || !claimProof) {
				this.resetRewards();
				return;
			}

			// when prices aren't available the claim balances will be zero even if the account has unclaimed rewards
			if (!arePricesAvailable) {
				throw new Error('Error: Prices are not available for current network');
			}

			this.loadingRewards = true;

			const web3 = new Web3(wallet?.provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], network.badgerTree);
			const claimed: TreeClaimData = await rewardsTree.methods.getClaimedFor(address, claimProof.tokens).call();

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
			const { wallet, address } = this.store.onboard;
			const { queueNotification } = this.store.uiState;
			const { gasPrices, network } = this.store.network;
			const { rebase } = this.store.rebase;

			if (!address) {
				return;
			}

			let sharesPerFragment = new BigNumber(1);
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

				let claimAmount = claimBalance.toFixed(0);
				if (token.address === ETH_DEPLOY.tokens.digg) {
					claimBalance = claimBalance
						.multipliedBy(Math.pow(10, token.decimals))
						.multipliedBy(sharesPerFragment);
				}

				if (claimBalance.gt(claimableAmount)) {
					claimAmount = claimableAmount.toFixed();
				}
				amountsToClaim.push(claimAmount);
			});

			if (amountsToClaim.length < proof.tokens.length) {
				queueNotification(`Error retrieving tokens for claiming.`, 'error');
				return;
			}

			const web3 = new Web3(wallet?.provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], network.badgerTree);
			const method = rewardsTree.methods.claim(
				proof.tokens,
				proof.cumulativeAmounts,
				proof.index,
				proof.cycle,
				proof.proof,
				amountsToClaim,
			);

			queueNotification(`Sign the transaction to claim your earnings`, 'info');

			const price = gasPrices ? gasPrices[GasSpeed.Fast] : 0;
			const options = await getSendOptions(method, address, price);
			await sendContractMethod(this.store, method, options, `Claim submitted.`, `Rewards claimed.`);
		},
	);
}

export default RewardsStore;
