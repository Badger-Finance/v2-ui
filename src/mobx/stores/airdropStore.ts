import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { jsonQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export interface AirdropInformation {
	token: string;
	amount: BigNumber;
	proof: any;
	airdropAbi: AbiItem[];
	airdropContract: string;
}

class AirdropStore {
	private store!: RootStore;

	public airdrops: AirdropInformation[];

	constructor(store: RootStore) {
		this.store = store;
		this.airdrops = [];

		extendObservable(this, {
			airdrops: this.airdrops,
		});
	}

	fetchAirdrops = action(() => {
		const { provider, connectedAddress, network } = this.store.wallet;
		if (!connectedAddress) return;
		if (!network.airdrops) return;

		const web3 = new Web3(provider);
		this.airdrops = [];

		// For each active airdrop in airdrops.ts:
		// Call API to get merkle proof
		// Check if claimed
		// Set airdrop
		network.airdrops.forEach((airdrop) => {
			if (!airdrop.active) return;
			// TODO: merkleproof typing
			jsonQuery(`${airdrop.endpoint}/${connectedAddress}`)?.then((merkleProof: any) => {
				if (!!merkleProof.index || merkleProof.index === 0) {
					const contract = new web3.eth.Contract(airdrop.airdropAbi, airdrop.airdropContract);
					// TODO: response typing
					Promise.all([contract.methods.isClaimed(merkleProof.index).call()]).then((result: any[]) => {
						if (!result[0]) {
							this.airdrops.push({
								token: airdrop.token,
								amount: new BigNumber(merkleProof.amount),
								airdropContract: airdrop.airdropContract,
								airdropAbi: airdrop.airdropAbi,
								proof: merkleProof,
							});
						}
					});
				}
			});
		});
	});

	// TODO: merkle proof typing
	claimAirdrops = action((airdropContract: string, airdropAbi: AbiItem[], proof: any) => {
		const { provider, gasPrices, connectedAddress, network } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;
		if (!network.airdrops) return;

		const web3 = new Web3(provider);
		const airdropTree = new web3.eth.Contract(airdropAbi, airdropContract);
		const method = airdropTree.methods.claim(proof.index, connectedAddress, proof.amount, proof.proof);

		queueNotification(`Sign the transaction to claim your airdrop`, 'info');
		if (!gasPrices || !gasPrices[gasPrice]) {
			queueNotification(
				`Error retrieving gas selection - check the gas selector in the top right corner.`,
				'error',
			);
			return;
		}
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
