import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { jsonQuery } from '../utils/helpers';
import { AbiItem } from 'web3-utils';
import { getSendOptions } from 'mobx/utils/web3';
import { TransactionReceipt } from 'web3-core';

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
	claimAirdrops = action(
		async (airdropContract: string, airdropAbi: AbiItem[], proof: any): Promise<void> => {
			const { provider, gasPrices, connectedAddress, network } = this.store.wallet;
			const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

			if (!connectedAddress || !network.airdrops) {
				return;
			}

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

			const price = gasPrices[gasPrice];
			const options = await getSendOptions(method, connectedAddress, price);
			await method
				.send(options)
				.on('transactionHash', (_hash: string) => {
					// TODO: Hash seems to do nothing - investigate this?
					queueNotification(`Claim submitted.`, 'info', _hash);
				})
				/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
				.on('receipt', (_receipt: TransactionReceipt) => {
					queueNotification(`Airdrop claimed.`, 'success');
					this.store.user.updateBalances();
				})
				.on('error', (error: Error) => {
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		},
	);
}

export default AirdropStore;
