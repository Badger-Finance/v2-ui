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
import { badgerTree, digg_system, tokens } from '../../config/deployments/mainnet.json';
import { ClaimMap } from '../../components-v2/landing/RewardsModal';
import BigNumber from 'bignumber.js';

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

	fetchSettRewards = action(() => {
		const { provider, connectedAddress, network } = this.store.wallet;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsAbi as AbiItem[], badgerTree);
		const checksumAddress = Web3.utils.toChecksumAddress(connectedAddress);
		const diggToken = new web3.eth.Contract(diggAbi as AbiItem[], digg_system.uFragments);

		if (!network.rewards) {
			this.badgerTree = undefined;
			return;
		}

		const treeMethods = [
			rewardsTree.methods.lastPublishTimestamp().call(),
			rewardsTree.methods.merkleContentHash().call(),
		];

		Promise.all(treeMethods)
			.then((rewardsResponse: any) => {
				this.badgerTree = _.defaults(
					{
						timeSinceLastCycle: reduceTimeSinceLastCycle(rewardsResponse[0]),
					},
					this.badgerTree,
				);
				if (network.rewards) {
					const endpointQuery = jsonQuery(`${network.rewards.endpoint}/${checksumAddress}`);
					if (!endpointQuery) {
						return;
					}
					endpointQuery
						.then((proof: any) => {
							if (!network.rewards) {
								return;
							}
							Promise.all([
								rewardsTree.methods.getClaimedFor(connectedAddress, proof.tokens).call(),
								diggToken.methods._sharesPerFragment().call(),
								rewardsTree.methods
									.getClaimableFor(connectedAddress, proof.tokens, proof.cumulativeAmounts)
									.call(),
							])
								.then((result: any[]) => {
									if (!proof.error) {
										this.badgerTree = _.defaults(
											{
												cycle: parseInt(proof.cycle, 16),
												claims: reduceClaims(proof, result[0][0], result[0][1]),
												sharesPerFragment: new BigNumber(result[1]),
												proof,
												claimableAmounts: result[2][1],
											},
											this.badgerTree,
										);
									}
								})
								.catch((err) => console.log(err));
						})
						.catch((err) => console.log('error: ', err));
				}
			})
			.catch((err) => console.log(err));
	});

	claimGeysers = action((stake = false, claimMap: ClaimMap | undefined) => {
		const { proof, claimableAmounts } = this.badgerTree;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!claimMap) return;

		if (!connectedAddress || !proof || !claimableAmounts) {
			queueNotification(`Error retrieving merkle proof.`, 'error');
			return;
		}

		const amountsToClaim: BigNumber[] = [];

		proof.tokens.map((address: string) => {
			if (address === tokens.digg)
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
