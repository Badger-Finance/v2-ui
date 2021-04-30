import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { estimateAndSend } from '../utils/web3';
import { RootStore } from '../store';
import { abi as rewardsAbi } from '../../config/system/abis/BadgerTree.json';
import { abi as diggAbi } from '../../config/system/abis/UFragments.json';
import { badgerTree, digg_system } from '../../config/deployments/mainnet.json';
import BigNumber from 'bignumber.js';
import { TreeClaimData } from 'mobx/model';
import { reduceClaims, reduceTimeSinceLastCycle } from 'mobx/reducers/statsReducers';
import _ from 'lodash';

class RewardsStore {
	private store!: RootStore;

	public badgerTree?: any; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			badgerTree: { cycle: '...', timeSinceLastCycle: '0h 0m', claims: [0] },
		});

		observe(this.store.wallet, 'connectedAddress', () => {
			if (!!this.store.wallet.network.rewards) this.fetchSettRewards();
		});

		setInterval(this.fetchSettRewards, 6e4);
	}

	fetchSettRewards = action(
		async (): Promise<void> => {
			const { provider, connectedAddress, network } = this.store.wallet;
			const { claimProof } = this.store.user;

			if (!connectedAddress || !claimProof || !network.rewards) {
				this.badgerTree = undefined;
				return;
			}

			const web3 = new Web3(provider);
			const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
			const diggToken = new web3.eth.Contract(diggAbi as AbiItem[], digg_system.uFragments);

			const [timestamp, cycle, claimed, claimable, sharesPerFragment]: [
				number,
				number,
				TreeClaimData,
				TreeClaimData,
				BigNumber,
			] = await Promise.all([
				rewardsTree.methods.lastPublishTimestamp().call(),
				rewardsTree.methods.currentCycle().call(),
				rewardsTree.methods.getClaimedFor(connectedAddress, claimProof.tokens).call(),
				rewardsTree.methods
					.getClaimableFor(connectedAddress, claimProof.tokens, claimProof.cumulativeAmounts)
					.call(),
				diggToken.methods._sharesPerFragment().call(),
			]);

			// TODO: introduce typing in badger tree
			this.badgerTree = _.defaults(
				{
					timeSinceLastCycle: reduceTimeSinceLastCycle(timestamp),
					cycle,
					claims: reduceClaims(claimProof, claimed.tokens, claimed.amounts),
					sharesPerFragment: sharesPerFragment,
					claimProof,
					claimableAmounts: claimable.amounts,
				},
				this.badgerTree,
			);
		},
	);

	claimGeysers = action((stake = false) => {
		const { proof, claimableAmounts } = this.badgerTree;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress || !proof || !claimableAmounts) {
			queueNotification(`Error retrieving merkle proof.`, 'error');
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
			claimableAmounts,
		);

		queueNotification(`Sign the transaction to claim your earnings`, 'info');
		if (stake)
			queueNotification(`You will need to approve 3 transactions in order to wrap & stake your assets`, 'info');
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
