import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { RootStore } from '../store';
import { abi as rewardsAbi } from '../../config/system/abis/BadgerTree.json';
import { abi as diggAbi } from '../../config/system/abis/UFragments.json';
import { badgerTree, digg_system } from '../../config/deployments/mainnet.json';
import BigNumber from 'bignumber.js';
import { reduceClaims, reduceTimeSinceLastCycle } from 'mobx/reducers/statsReducers';
import { getSendOptions } from 'mobx/utils/web3';
import { getToken } from '../../web3/config/token-config';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { ETH_DEPLOY } from 'web3/config/eth-config';
import { mockToken } from 'mobx/model/tokens/badger-token';
import { NETWORK_LIST } from 'config/constants';
import { getNetworkFromProvider } from 'mobx/utils/helpers';
import { ClaimMap } from 'components-v2/landing/RewardsModal';
import { BadgerTree } from '../model/rewards/badger-tree';
import { TreeClaimData } from '../model/rewards/tree-claim-data';

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
		timeSinceLastCycle: '0h 0m',
		proof: undefined,
		sharesPerFragment: undefined,
		claimableAmounts: [],
		claims: [],
		amounts: [],
	};
	public badgerTree: BadgerTree;
	public loadingRewards: boolean;
	public loadingDiggData: boolean;

	constructor(store: RootStore) {
		this.store = store;
		this.badgerTree = RewardsStore.defaultTree;
		this.loadingRewards = false;
		this.loadingDiggData = false;

		extendObservable(this, {
			badgerTree: this.badgerTree,
			loadingRewards: this.loadingRewards,
			loadingDiggData: this.loadingDiggData,
		});
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromString(token: string, balance: string): TokenBalance {
		const badgerToken = getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);
		if (!badgerToken || !tokenPrice) {
			const amount = new BigNumber(balance);
			return new TokenBalance(mockToken(token), amount, new BigNumber(0));
		}
		const scalar = new BigNumber(Math.pow(10, badgerToken.decimals));
		const amount = new BigNumber(balance).multipliedBy(scalar);
		return new TokenBalance(badgerToken, amount, tokenPrice);
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromProof(token: string, balance: string): TokenBalance {
		const claimToken = getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);
		if (!claimToken || !tokenPrice) {
			const amount = new BigNumber(balance);
			return new TokenBalance(mockToken(token), amount, new BigNumber(0));
		}
		let divisor = new BigNumber(1);
		const isDigg = claimToken.address === ETH_DEPLOY.tokens.digg;
		if (isDigg && this.badgerTree.sharesPerFragment) {
			divisor = this.badgerTree.sharesPerFragment;
		}
		const amount = new BigNumber(balance).dividedBy(divisor);
		return new TokenBalance(claimToken, amount, tokenPrice);
	}

	tokenBalance(token: string, amount: BigNumber): TokenBalance {
		const badgerToken = getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);
		let scalar = new BigNumber(1);
		const isDigg = token === ETH_DEPLOY.tokens.digg;
		if (isDigg && this.badgerTree.sharesPerFragment) {
			scalar = this.badgerTree.sharesPerFragment;
		}
		const balance = amount.dividedBy(scalar);
		if (!badgerToken || !tokenPrice) {
			return new TokenBalance(mockToken(token), balance, new BigNumber(0));
		}
		return new TokenBalance(badgerToken, balance, tokenPrice);
	}

	mockBalance(token: string): TokenBalance {
		return this.balanceFromString(token, '0');
	}

	sharesPerFragment = (): BigNumber | undefined => {
		return this.badgerTree.sharesPerFragment;
	};

	resetRewards = action((): void => {
		this.badgerTree.claimableAmounts = [];
		this.badgerTree.claims = [];
		this.badgerTree.amounts = [];
		this.badgerTree.proof = undefined;
	});

	loadTreeData = action(
		async (): Promise<void> => {
			const { provider } = this.store.wallet;

			if (this.loadingRewards) {
				return;
			}
			this.resetRewards();
			this.loadingRewards = true;

			const web3 = new Web3(provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
			const diggToken = new web3.eth.Contract(diggAbi as AbiItem[], digg_system.uFragments);

			const [timestamp, cycle, sharesPerFragment]: [number, number, number] = await Promise.all([
				rewardsTree.methods.lastPublishTimestamp().call(),
				rewardsTree.methods.currentCycle().call(),
				diggToken.methods._sharesPerFragment().call(),
			]);

			this.badgerTree.cycle = cycle.toString();
			this.badgerTree.timeSinceLastCycle = reduceTimeSinceLastCycle(timestamp);
			this.badgerTree.sharesPerFragment = new BigNumber(sharesPerFragment);
			await this.fetchSettRewards();
		},
	);

	fetchSettRewards = action(
		async (): Promise<void> => {
			const { provider, connectedAddress, network } = this.store.wallet;
			const { claimProof } = this.store.user;

			// M50: Rewards only live on ETH, make sure provider is an ETH mainnet one.
			const networkName = getNetworkFromProvider(provider);
			if (!connectedAddress || !claimProof || !network.rewards || networkName !== NETWORK_LIST.ETH) {
				this.resetRewards();
				this.loadingRewards = false;
				return;
			}

			const web3 = new Web3(provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
			const claimed: TreeClaimData = await rewardsTree.methods
				.getClaimedFor(connectedAddress, claimProof.tokens)
				.call();
			this.badgerTree.claimableAmounts = claimProof.cumulativeAmounts;
			this.badgerTree.claims = reduceClaims(claimProof, claimed, true);
			this.badgerTree.amounts = reduceClaims(claimProof, claimed);
			this.badgerTree.proof = claimProof;
			this.loadingRewards = false;
		},
	);

	claimGeysers = action(
		async (claimMap: ClaimMap): Promise<void> => {
			const { proof, amounts, sharesPerFragment } = this.badgerTree;
			const { provider, gasPrices, connectedAddress } = this.store.wallet;
			const { queueNotification, gasPrice } = this.store.uiState;

			if (!connectedAddress || !sharesPerFragment) {
				return;
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

			const web3 = new Web3(provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
			const method = rewardsTree.methods.claim(
				proof.tokens,
				proof.cumulativeAmounts,
				proof.index,
				proof.cycle,
				proof.proof,
				amountsToClaim,
			);

			queueNotification(`Sign the transaction to claim your earnings`, 'info');

			const price = gasPrices[gasPrice];
			const options = await getSendOptions(method, connectedAddress, price);
			await method
				.send(options)
				.on('transactionHash', (_hash: string) => {
					queueNotification(`Claim submitted.`, 'info', _hash);
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
					this.fetchSettRewards();
					this.store.user.updateBalances();
				})
				.on('error', (error: Error) => {
					queueNotification(error.message, 'error');
				});
		},
	);
}

export default RewardsStore;
