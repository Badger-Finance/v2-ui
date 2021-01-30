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

import { RPC_URL } from 'config/constants';
import { rewards as airdropsConfig, token as diggTokenConfig } from '../../config/system/rebase';

const infuraProvider = new Web3.providers.HttpProvider(RPC_URL);
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: 'NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P',
		delayTime: 300,
	},
};

let batchCall = new BatchCall(options);

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
		const {} = this.store.uiState;
		// console.log('fetching', connectedAddress)

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const diggToken = new web3.eth.Contract(diggTokenConfig.abi as any, diggTokenConfig.contract);
		const checksumAddress = connectedAddress.toLowerCase();
		// console.log('fetching', `${airdropsConfig.endpoint}/${checksumAddress}`)

		jsonQuery(`${airdropsConfig.endpoint}/${checksumAddress}`).then((merkleProof: any) => {
			// console.log('proof', new BigNumber(Web3.utils.hexToNumberString(merkleProof.amount)).toString())
			if (!merkleProof.error) {
				Promise.all([
					rewardsTree.methods.isClaimed(merkleProof.index).call(),
					diggToken.methods
						.sharesToFragments(new BigNumber(Web3.utils.hexToNumberString(merkleProof.amount)).toFixed(0))
						.call(),
				]).then((result: any[]) => {
					// console.log(new BigNumber(result[1]).multipliedBy(1e9))
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

		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const method = rewardsTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof,
		);

		queueNotification(`Sign the transaction to claim your airdrop`, 'info');
		const badgerAmount = this.airdrops.badger;
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
		// console.log(merkleProof, this.airdrops);
		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const rewardsTree = new web3.eth.Contract(airdropsConfig.abi as any, airdropsConfig.contract);
		const method = rewardsTree.methods.claim(
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
