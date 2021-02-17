import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import { jsonQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { rewards as airdropsConfig, token as diggTokenConfig } from '../../config/system/rebase';

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

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const diggToken = new web3.eth.Contract(diggTokenConfig.abi as any, diggTokenConfig.contract);
		const checksumAddress = connectedAddress.toLowerCase();

		jsonQuery(`${airdropsConfig.endpoint}/${checksumAddress}`).then((merkleProof: any) => {
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

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const method = rewardsTree.methods.claim(
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

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const method = rewardsTree.methods.claim(
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
}

export default AirdropStore;
