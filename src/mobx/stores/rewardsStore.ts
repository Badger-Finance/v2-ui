import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

import { estimateAndSend } from '../utils/web3';
import { RootStore } from '../store';
import _ from 'lodash';
import { jsonQuery } from '../utils/helpers';
import { reduceClaims, reduceTimeSinceLastCycle } from '../reducers/statsReducers';
import { abi as rewardsAbi } from '../../config/system/abis/BadgerTree.json';
import { abi as diggAbi } from '../../config/system/abis/UFragments.json';

import { badgerTree, digg_system } from '../../config/deployments/mainnet.json';

import { rewards as rewardsConfig } from 'config/system/geysers';

class RewardsStore {
	private store!: RootStore;

	public badgerTree?: any; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			badgerTree: { cycle: '...', timeSinceLastCycle: '0h 0m', claims: [0] },
		});

		observe(this.store.wallet, 'connectedAddress', () => {
			this.fetchSettRewards();
		});

		setInterval(this.fetchSettRewards, 6e4);
	}

	fetchSettRewards = action(() => {
		const { provider, connectedAddress } = this.store.wallet;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
		const checksumAddress = Web3.utils.toChecksumAddress(connectedAddress);
		const diggToken = new web3.eth.Contract(diggAbi as AbiItem[], digg_system.uFragments);

		const treeMethods = [
			rewardsTree.methods.lastPublishTimestamp().call(),
			rewardsTree.methods.merkleContentHash().call(),
		];

		Promise.all(treeMethods)
			.then((rewardsResponse: any) => {
				const merkleHash = rewardsResponse[1];

				this.badgerTree = _.defaults(
					{
						timeSinceLastCycle: reduceTimeSinceLastCycle(rewardsResponse[0]),
					},
					this.badgerTree,
				);

				const endpointQuery = jsonQuery(`${rewardsConfig.endpoint}/${checksumAddress}`);

				endpointQuery
					.then((proof: any) => {
						Promise.all([
							rewardsTree.methods.getClaimedFor(connectedAddress, rewardsConfig.tokens).call(),
							diggToken.methods._sharesPerFragment().call(),
						])
							.then((result: any[]) => {
								if (!proof.error) {
									this.badgerTree = _.defaults(
										{
											cycle: parseInt(proof.cycle, 16),
											claims: reduceClaims(proof, result[0][0], result[0][1]),
											sharesPerFragment: result[1],
											proof,
										},
										this.badgerTree,
									);
								}
							})
							.catch((err) => console.log(err));
					})
					.catch((err) => console.log('error: ', err));
			})
			.catch((err) => console.log(err));
	});

	claimGeysers = action((stake = false) => {
		const { proof } = this.badgerTree;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
		const method = rewardsTree.methods.claim(
			proof.tokens,
			proof.cumulativeAmounts,
			proof.index,
			proof.cycle,
			proof.proof,
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
