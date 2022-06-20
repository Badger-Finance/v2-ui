import { RewardTree } from '@badger-dao/sdk';
import { BigNumber } from 'ethers';
import { action, makeAutoObservable } from 'mobx';
import { TokenBalances } from 'mobx/model/account/user-balances';
import { TokenBalance } from 'mobx/model/tokens/token-balance';
import { RootStore } from './RootStore';

export class TreeStore {
	public cycle?: number = undefined;
	public lastUpdateTimestamp?: number = undefined;
	public lastUpdate?: string = undefined;
	public claimProof?: RewardTree = undefined;
	public claimable: TokenBalances = {};
	public loadingTree = false;

	constructor(private store: RootStore) {
		makeAutoObservable(this, {
			loadBadgerTree: action,
		});
	}

	async loadBadgerTree() {
		const {
			api,
			sdk,
			wallet: { address },
			prices,
		} = this.store;
		const {
			config: { network },
		} = sdk;

		if (!address) {
			return;
		}

		this.loadingTree = true;

		// Load user claim proofs
		try {
			this.claimProof = await api.loadRewardTree(address, network);
		} catch {} // 404 means user has no valid proof

		// Load BadgerTree metadata
		try {
			const [treeCycle, lastTreeUpdate] = await Promise.all([
				sdk.rewards.badgerTree.currentCycle(),
				sdk.rewards.badgerTree.lastPublishTimestamp(),
			]);
			this.lastUpdateTimestamp = lastTreeUpdate.toNumber();
			this.lastUpdate = this.calculateDelta(this.lastUpdateTimestamp);
			this.cycle = treeCycle.toNumber();
		} catch (err) {
			console.error({
				err,
				message: 'Unable to load BadgerTree metadata',
			});
			this.loadingTree = false;
			return;
		}

		if (this.claimProof) {
			// Caculate user claimable
			try {
				const { tokens, cumulativeAmounts } = this.claimProof;
				const claimedFor = await sdk.rewards.badgerTree.getClaimedFor(address, tokens);
				const claimedAmounts = claimedFor[1];

				const claimCumulativeAmounts = cumulativeAmounts.slice().map((a) => BigNumber.from(a));
				// handle rewards team bad proof amounts...
				for (let i = 0; i < claimedAmounts.length; i++) {
					const claimed = claimedAmounts[i];
					const cumulative = cumulativeAmounts[i];
					if (claimed.gt(cumulative)) {
						claimCumulativeAmounts[i] = claimed;
					}
				}

				const claimableFor = await sdk.rewards.badgerTree.getClaimableFor(
					address,
					tokens,
					claimCumulativeAmounts,
				);

				const claimableTokens = claimableFor[0];
				const claimableAmounts = claimableFor[1];
				const tokenInformation = await sdk.tokens.loadTokens(claimableTokens);

				for (let i = 0; i < claimableTokens.length; i++) {
					const token = tokenInformation[claimableTokens[i]];
					const amount = claimableAmounts[i];
					const price = prices.getPrice(token.address);
					this.claimable[token.address] = new TokenBalance(token, amount, price);
				}
			} catch (err) {
				console.error({
					err,
					message: `Unable to load rewards claimable for ${address}`,
				});
			}
		}

		this.loadingTree = false;
	}

	reset() {
		this.cycle = undefined;
		this.lastUpdate = undefined;
		this.claimProof = undefined;
		this.claimable = {};
	}

	async reportInvalidCycle() {
		const { network } = this.store.network;
		const webhookUrl = process.env.REACT_APP_FRONTEND_ALERTS_DISCORD_WEBHOOK_URL;

		if (!webhookUrl) {
			console.error('Error: No Discord alerts webhook url was found in the environment');
			return;
		}

		if (!this.claimProof) {
			return;
		}

		try {
			await fetch(webhookUrl, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					embeds: [
						{
							title: 'Invalid Cycle Detected',
							color: 16721408,
							content: '<@&804147406043086850>',
							description: 'An invalid cycle has been detected during rewards claiming.',
							timestamp: new Date(),
							fields: [
								{
									name: 'Cycle',
									value: this.cycle,
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
			});
		} catch (err) {
			console.log({
				err,
				message: 'Unable to report invalid cycle',
			});
		}
	}

	private calculateDelta(time: number): string {
		const timestamp = time * 1000;
		const timeSinceLastCycle = Math.abs(Date.now() - timestamp);
		return (
			Math.floor(timeSinceLastCycle / (60 * 60 * 1000)) +
			'h ' +
			Math.round(((timeSinceLastCycle % 86400000) % 3600000) / 60000) +
			'm'
		);
	}
}
