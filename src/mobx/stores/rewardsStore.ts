import { retry } from '@lifeomic/attempt';
import { BigNumber } from 'ethers';
import { action, extendObservable } from 'mobx';
import { ETH_DEPLOY } from 'mobx/model/network/eth.network';
import { RewardMerkleClaim } from 'mobx/model/rewards/reward-merkle-claim';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { reduceClaims, reduceTimeSinceLastCycle } from 'mobx/utils/statsReducers';

import { defaultRetryOptions } from '../../config/constants';
import { abi as rewardsAbi } from '../../config/system/abis/BadgerTree.json';
import { BadgerTree } from '../model/rewards/badger-tree';
import { TreeClaimData } from '../model/rewards/tree-claim-data';
import { RootStore } from './RootStore';

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

	get claimableRewards(): number {
		return this.badgerTree.claims.reduce((total, reward) => (total += reward.value), 0);
	}

	get isLoading(): boolean {
		return this.loadingTreeData || this.loadingRewards;
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromString(token: string, balance: string): TokenBalance {
		const badgerToken = this.store.vaults.getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);
		if (!tokenPrice) {
			const amount = BigNumber.from(balance);
			return new TokenBalance(badgerToken, amount, 0);
		}
		const scalar = BigNumber.from(Math.pow(10, badgerToken.decimals));
		const amount = BigNumber.from(balance).mul(scalar);
		return new TokenBalance(badgerToken, amount, tokenPrice);
	}

	// TODO: refactor various functions for a more unified approach
	balanceFromProof(token: string, balance: string): TokenBalance {
		const { rebase: rebaseInfo } = this.store.rebase;
		const claimToken = this.store.vaults.getToken(token);
		const tokenPrice = this.store.prices.getPrice(token);

		if (!tokenPrice) {
			const amount = BigNumber.from(balance);
			return new TokenBalance(claimToken, amount, 0);
		}

		const isDigg = claimToken.address === ETH_DEPLOY.tokens.digg;
		const divisor =
			isDigg && rebaseInfo ? BigNumber.from(rebaseInfo.sharesPerFragment.toString()) : BigNumber.from(1);

		const amount = BigNumber.from(balance).div(divisor);
		return new TokenBalance(claimToken, amount, tokenPrice);
	}

	mockBalance(token: string): TokenBalance {
		return new TokenBalance(
			this.store.vaults.getToken(token),
			BigNumber.from(0),
			this.store.prices.getPrice(token),
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

	loadTreeData = action(async (): Promise<void> => {
		const {
			network: { network },
			uiState: { queueNotification },
			wallet,
		} = this.store;

		if (this.loadingTreeData || !wallet.web3Instance) {
			return;
		}

		if (!network.badgerTree) {
			console.error('Error: No badger tree address was found in current network deploy config');
			return;
		}

		this.loadingTreeData = true;

		const rewardsTree = new wallet.web3Instance.eth.Contract(rewardsAbi as AbiItem[], network.badgerTree);
		try {
			const [timestamp, cycle] = await Promise.all([
				rewardsTree.methods.lastPublishTimestamp().call(),
				rewardsTree.methods.currentCycle().call(),
			]);
			this.badgerTree.lastCycle = new Date(timestamp * 1000);
			this.badgerTree.cycle = cycle.toString();
			this.badgerTree.timeSinceLastCycle = this.reduceTimeSinceLastCycle(timestamp);
			await retry(() => this.fetchVaultRewards(), defaultRetryOptions);
		} catch (error) {
			console.error('There was an error fetching rewards information: ', error);
			queueNotification(
				`Error retrieving rewards information, please refresh the page or check your web3 provider.`,
				'error',
			);
		}

		this.loadingTreeData = false;
	});

	fetchVaultRewards = action(async (): Promise<void> => {
		const {
			network: { network },
			prices: { arePricesAvailable },
			user: { claimProof },
			wallet: { address, web3Instance },
		} = this.store;

		if (this.loadingRewards) {
			return;
		}

		if (!network.badgerTree) {
			console.error('Error: No badger tree address was found in current network deploy config');
			return;
		}

		if (!web3Instance || !claimProof || !address) {
			this.resetRewards();
			return;
		}

		// when prices aren't available the claim balances will be zero even if the account has unclaimed rewards
		if (!arePricesAvailable) {
			throw new Error('Error: Prices are not available for current network');
		}

		this.loadingRewards = true;

		const rewardsTree = new web3Instance.eth.Contract(rewardsAbi as AbiItem[], network.badgerTree);
		const claimed: TreeClaimData = await rewardsTree.methods.getClaimedFor(address, claimProof.tokens).call();

		this.badgerTree.claimableAmounts = claimProof.cumulativeAmounts;
		this.badgerTree.claims = this.reduceClaims(claimProof, claimed, true);
		this.badgerTree.amounts = this.reduceClaims(claimProof, claimed);
		this.badgerTree.proof = claimProof;

		this.loadingRewards = false;
	});

	reportInvalidCycle() {
		const { network } = this.store.network;
		const webhookUrl = process.env.REACT_APP_FRONTEND_ALERTS_DISCORD_WEBHOOK_URL;
		const { proof } = this.badgerTree;

		if (!webhookUrl) {
			console.error('Error: No Discord alerts webhook url was found in the environment');
			return;
		}

		if (!proof) {
			return;
		}

		fetch(webhookUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				embeds: [
					{
						title: 'Invalid Cycle Detected',
						color: 16721408,
						description:
							'An invalid cycle has been detected during rewards claiming. <@&804147406043086850>',
						timestamp: new Date(),
						fields: [
							{
								name: 'Cycle',
								value: Number(proof.cycle),
								inline: true,
							},
							{
								name: 'When',
								value: new Date().toUTCString(),
								inline: true,
							},
							{
								name: 'Network',
								value: network.name,
								inline: true,
							},
						],
					},
				],
				components: [],
			}),
		})
			.then()
			.catch(console.error);
	}
}

export default RewardsStore;
