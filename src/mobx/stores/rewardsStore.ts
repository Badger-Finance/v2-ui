import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { estimateAndSend } from '../utils/web3';
import { RootStore } from '../store';
import { abi as rewardsAbi } from '../../config/system/abis/BadgerTree.json';
import { abi as diggAbi } from '../../config/system/abis/UFragments.json';
import { badgerTree, digg_system, tokens } from '../../config/deployments/mainnet.json';
import BigNumber from 'bignumber.js';
import { BadgerTree, TreeClaimData } from 'mobx/model';
import { ClaimMap } from '../../components-v2/landing/RewardsModal';
import { reduceClaims, reduceTimeSinceLastCycle } from 'mobx/reducers/statsReducers';

class RewardsStore {
	private store!: RootStore;
	private static defaultTree: BadgerTree = {
		cycle: '...',
		timeSinceLastCycle: '0h 0m',
		proof: undefined,
		sharesPerFragment: undefined,
		claimableAmounts: undefined,
		claims: undefined,
	};
	public badgerTree: BadgerTree;

	constructor(store: RootStore) {
		this.store = store;
		this.badgerTree = RewardsStore.defaultTree;

		extendObservable(this, {
			badgerTree: this.badgerTree,
		});
	}

	resetRewards = action(() => (this.badgerTree = RewardsStore.defaultTree));

	fetchSettRewards = action(
		async (): Promise<void> => {
			const { provider, connectedAddress, network } = this.store.wallet;
			const { claimProof } = this.store.user;

			if (!connectedAddress || !claimProof || !network.rewards) {
				this.badgerTree = RewardsStore.defaultTree;
				return;
			}

			this.badgerTree = RewardsStore.defaultTree;
			const web3 = new Web3(provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
			const diggToken = new web3.eth.Contract(diggAbi as AbiItem[], digg_system.uFragments);

			const [timestamp, cycle, claimed, claimable, sharesPerFragment]: [
				number,
				number,
				TreeClaimData,
				TreeClaimData,
				number,
			] = await Promise.all([
				rewardsTree.methods.lastPublishTimestamp().call(),
				rewardsTree.methods.currentCycle().call(),
				rewardsTree.methods.getClaimedFor(connectedAddress, claimProof.tokens).call(),
				rewardsTree.methods
					.getClaimableFor(connectedAddress, claimProof.tokens, claimProof.cumulativeAmounts)
					.call(),
				diggToken.methods._sharesPerFragment().call(),
			]);
			this.badgerTree = {
				cycle: cycle.toString(),
				timeSinceLastCycle: reduceTimeSinceLastCycle(timestamp),
				proof: claimProof,
				sharesPerFragment: new BigNumber(sharesPerFragment),
				claims: reduceClaims(claimProof, claimed),
				claimableAmounts: claimable[1],
			};
		},
	);

	claimGeysers = action((claimMap: ClaimMap | undefined) => {
		const { proof, claimableAmounts } = this.badgerTree;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress || !proof || !claimableAmounts || !claimMap) {
			queueNotification(`Error retrieving merkle proof.`, 'error');
			return;
		}

		const amountsToClaim: BigNumber[] = [];
		proof.tokens.map((address: string) => {
			if (address === tokens.digg && !!this.badgerTree.sharesPerFragment)
				claimMap[address] = new BigNumber(claimMap[address])
					.multipliedBy(this.badgerTree.sharesPerFragment)
					.multipliedBy(1e9);

			const amount = claimMap[address] ? claimMap[address] : new BigNumber('0');
			// We check to see if the number is greater than the claimable amount due to
			// rounding on the UI.
			new BigNumber(amount).gt(new BigNumber(claimableAmounts[proof.tokens.indexOf(address)]))
				? amountsToClaim.push(claimableAmounts[proof.tokens.indexOf(address)])
				: amountsToClaim.push(amount);
		});

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
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash) => {
					queueNotification(`Claim submitted.`, 'info', hash);
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
					this.fetchSettRewards();
					this.store.contracts.fetchContracts();
				})
				.catch((error: any) => {
					this.store.contracts.fetchContracts();
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		});
	});
}

export default RewardsStore;
