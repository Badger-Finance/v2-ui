import { extendObservable, action } from 'mobx';
import Web3 from 'web3';

import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { jsonQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { airdropsConfig, airdropEndpoint } from '../../config/system/airdrops';
import { sett_system } from '../../config/deployments/mainnet.json';

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
		const { provider, connectedAddress } = this.store.wallet;
		if (!connectedAddress) return;

		const bBadgerAddress = sett_system.vaults['native.badger'];
		const web3 = new Web3(provider);
		const bBadgerAirdropTree = new web3.eth.Contract(
			airdropsConfig[bBadgerAddress].airdropAbi,
			airdropsConfig[bBadgerAddress].airdropContract,
		);
		const checksumAddress = connectedAddress.toLowerCase();
		//TODO: Update to handle the airdrop based on what token is available via airdrops.ts config
		jsonQuery(`${airdropEndpoint}/gitcoin/${checksumAddress}`).then((merkleProof: any) => {
			if (!!merkleProof.index) {
				Promise.all([bBadgerAirdropTree.methods.isClaimed(merkleProof.index).call()]).then((result: any[]) => {
					this.airdrops = {
						bBadger: !result[0] ? new BigNumber(merkleProof.amount) : new BigNumber(0),
						merkleProof,
					};
				});
			} else {
				this.airdrops = { bBadger: null };
			}
		});
	});

	claimAirdrops = action((contract: string) => {
		const { merkleProof } = this.airdrops;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;

		const web3 = new Web3(provider);
		const airdropTree = new web3.eth.Contract(
			airdropsConfig[contract].airdropAbi,
			airdropsConfig[contract].airdropContract,
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
}

export default AirdropStore;
