import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import { jsonQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { airdropsConfig, airdropEndpoint } from '../../config/system/airdrops';

class AirdropStore {
	private store!: RootStore;

	public airdrops?: any; // geyser contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			airdrops: {},
		});
	}

	fetchAirdrops = action(() => {
		const { provider, connectedAddress, isCached } = this.store.wallet;
		const { digg_system } = require('../../config/deployments/mainnet.json');
		const {} = this.store.uiState;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(
			airdropsConfig[digg_system.uFragments].airdropAbi,
			airdropsConfig[0].airdropContract,
		);
		const diggToken = new web3.eth.Contract(
			airdropsConfig[digg_system.uFragments].tokenAbi,
			digg_system.uFragments,
		);
		const checksumAddress = connectedAddress.toLowerCase();

		//TODO: Update to handle the airdrop based on what token is available via airdrops.ts config
		jsonQuery(`${airdropEndpoint}/${checksumAddress}`).then((merkleProof: any) => {
			if (!merkleProof.error) {
				Promise.all([
					rewardsTree.methods.isClaimed(merkleProof.index).call(),
					diggToken.methods
						.sharesToFragments(new BigNumber(Web3.utils.hexToNumberString(merkleProof.amount)).toFixed(0))
						.call(),
				]).then((result: any[]) => {
					this.airdrops = {
						digg: !result[0] ? new BigNumber(result[1]) : new BigNumber(0),
						merkleProof,
					};
				});
			} else {
				this.airdrops = {};
			}
		});
	});

	claimBadgerAirdrops = action((stake = false) => {
		const { merkleProof } = this.airdrops;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;
		const { token } = require('../../config/deployments/mainnet.json');

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const airdropTree = new web3.eth.Contract(
			airdropsConfig[token].airdropAbi,
			airdropsConfig[token].airdropContract,
		);
		const method = airdropTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof,
		);

		queueNotification(`Sign the transaction to claim your airdrop`, 'info');
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash) => {
					queueNotification(`Claim submitted.`, 'info', hash);
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
					this.store.contracts.fetchContracts();
				})
				.catch((error: any) => {
					this.store.contracts.fetchContracts();
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		});
	});
	claimDiggAirdrops = action((stake = false) => {
		const { merkleProof } = this.airdrops;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;
		const { digg_system } = require('../../config/deployments/mainnet.json');

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const airdropTree = new web3.eth.Contract(
			airdropsConfig[digg_system.uFragments].airdropAbi as any,
			airdropsConfig[digg_system.uFragments].airdropContract,
		);
		const method = airdropTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof,
		);

		queueNotification(`Sign the transaction to claim your airdrop`, 'info');
		const diggAmount = this.airdrops.digg;
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash) => {
					queueNotification(`Claim submitted.`, 'info', hash);
				})
				.on('receipt', () => {
					queueNotification(`Rewards claimed.`, 'success');
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

export default AirdropStore;
