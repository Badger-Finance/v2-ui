import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';


import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import {
	reduceGeyserSchedule,
	reduceSushiAPIResults,
	reduceXSushiROIResults,
} from '../reducers/contractReducers';
import { jsonQuery, vanillaQuery } from '../utils/helpers';
import { reduceClaims, reduceTimeSinceLastCycle } from '../reducers/statsReducers';

import {
	rewards as rewardsConfig,
	geyserBatches,
} from '../../config/system/contracts';


class RewardsStore {
	private store!: RootStore;

	public badgerTree?: any; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			badgerTree: { cycle: '...', timeSinceLastCycle: '0h 0m', claims: [0] },
		});

		setInterval(this.fetchSettRewards, 6e4);
	}

	fetchSettRewards = action(() => {
		const { provider, connectedAddress } = this.store.wallet;
		const { } = this.store.uiState;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsConfig.abi as any, rewardsConfig.contract);
		const checksumAddress = Web3.utils.toChecksumAddress(connectedAddress);

		const treeMethods = [
			rewardsTree.methods.lastPublishTimestamp().call(),
			rewardsTree.methods.merkleContentHash().call(),
		];

		Promise.all(treeMethods).then((rewardsResponse: any) => {
			const merkleHash = rewardsResponse[1];

			this.badgerTree = _.defaults(
				{
					timeSinceLastCycle: reduceTimeSinceLastCycle(rewardsResponse[0]),
				},
				this.badgerTree,
			);

			const endpointQuery = jsonQuery(
				`${rewardsConfig.endpoint}/rewards/${rewardsConfig.network}/${merkleHash}/${checksumAddress}`,
			);

			endpointQuery.then((proof: any) => {
				rewardsTree.methods
					.getClaimedFor(connectedAddress, rewardsConfig.tokens)
					.call()
					.then((claimedRewards: any[]) => {
						if (!proof.error) {
							this.badgerTree = _.defaults(
								{
									cycle: parseInt(proof.cycle, 16),
									claims: reduceClaims(proof, claimedRewards),
									proof,
								},
								this.badgerTree,
							);
						}
					});
			});
		});
	});

	claimGeysers = action((stake = false) => {
		const { proof } = this.badgerTree;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(rewardsConfig.abi as any, rewardsConfig.contract);
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
		const badgerAmount = new BigNumber(this.badgerTree.claims[0]).multipliedBy(1e18);
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

	calculateGeyserRewards = action(() => {
		const { geysers, tokens, vaults } = this.store.contracts;
		const { } = this.store.uiState;
		const { } = this.store.wallet;

		const rewardToken = tokens[rewardsConfig.tokens[0]];

		if (!tokens || !rewardToken) return;

		const timestamp = new BigNumber(new Date().getTime() / 1000.0);
		const geyserRewards = _.mapValues(geysers, (geyser: any) => {
			const schedule = geyser['getUnlockSchedulesFor'];
			const underlyingVault = vaults[geyser[geyser.underlyingKey]];

			if (!schedule || !underlyingVault) return {};

			const rawToken = tokens[underlyingVault[underlyingVault.underlyingKey]];

			// sum rewards in current period
			// todo: break out to actual durations
			const rewardSchedule = reduceGeyserSchedule(timestamp, schedule);

			return _.mapValues(rewardSchedule, (reward: any) => {
				return (
					!!rawToken.ethValue &&
					reward
						.multipliedBy(rewardToken.ethValue)
						.dividedBy(
							rawToken.ethValue
								.multipliedBy(underlyingVault.balance)
								.multipliedBy(underlyingVault.getPricePerFullShare.dividedBy(1e18)),
						)
				);
			});
		});

		// this.store.contracts.updateGeysers(geyserRewards);

		// grab sushi APYs
		// _.map(geyserBatches, (config: any) => {
		// 	if (!!config.growthEndpoints) {
		// 		// let masterChef = chefQueries(config.contracts, this.geysers, config.growthEndpoints[0])
		// 		const xSushi = vanillaQuery(config.growthEndpoints[1]);

		// 		// First we grab the sushi pair contracts from the sushi geysers
		// 		const sushiSuffix: string[] = [];
		// 		_.map(config.contracts, (contract: any) => {
		// 			try {
		// 				let geyser = geysers[contract];
		// 				let vault = vaults[geyser[geyser.underlyingKey]];
		// 				if (!geyser || !vault) return;
		// 				sushiSuffix.push(vault[vault.underlyingKey]);
		// 			} catch (e) {
		// 				process.env.NODE_ENV !== 'production' && console.log(e);
		// 			}
		// 		});
		// 		// Then we use the provided API from sushi to get the ROI numbers
		// 		const newMasterChef = vanillaQuery(config.growthEndpoints[2].concat(sushiSuffix.join(';')));

		// 		Promise.all([xSushi, newMasterChef]).then((results: any) => {
		// 			const xROI: any = reduceXSushiROIResults(results[0]['weekly_APY']);
		// 			const newSushiRewards = reduceSushiAPIResults(results[1], config.contracts);
		// 			this.store.contracts.updateGeysers(
		// 				_.mapValues(newSushiRewards, (reward: any, geyserAddress: string) => {
		// 					const geyser = geysers[geyserAddress];
		// 					if (!geyser) return;

		// 					const vault = vaults[geyser[geyser.underlyingKey]];
		// 					if (!vault) return;

		// 					const vaultBalance = vault.balance;
		// 					const tokenValue = this.store.contracts.tokens[vault.token].ethValue;
		// 					if (!tokenValue) return;

		// 					const vaultEthVal = vaultBalance.multipliedBy(tokenValue.dividedBy(1e18));
		// 					return {
		// 						sushiRewards: _.mapValues(reward, (periodROI: BigNumber, period: string) => {
		// 							if (periodROI.toString().substr(0, 2) != '0x') {
		// 								const sushiRewards = vaultEthVal.multipliedBy(periodROI);
		// 								const xsushiRewards = sushiRewards.multipliedBy(xROI[period].dividedBy(100));
		// 								const xsushiROI = xsushiRewards.dividedBy(vaultEthVal);
		// 								periodROI = periodROI.plus(xsushiROI);
		// 							}
		// 							return periodROI;
		// 						}),
		// 					};
		// 				}),
		// 			);
		// 		});
		// 	}
		// });
	});
}

export default RewardsStore;
