import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../RootStore';
import { AbiItem } from 'web3-utils';
import { getSendOptions } from 'mobx/utils/web3';
import { TransactionReceipt } from 'web3-core';
import { AirdropMerkleClaim } from 'mobx/model/rewards/airdrop-merkle-claim';
import { fetchData } from 'mobx/utils/helpers';

export interface AirdropInformation {
	token: string;
	amount: BigNumber;
	proof: AirdropMerkleClaim;
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

	fetchAirdrops = action(async () => {
		const { provider, connectedAddress } = this.store.wallet;
		const { network } = this.store.network;
		if (!connectedAddress || !network.airdrops) {
			return;
		}

		const web3 = new Web3(provider);
		this.airdrops = [];

		// For each active airdrop in airdrops.ts:
		// Call API to get merkle proof
		// Check if claimed
		// Set airdrop
		await Promise.all(
			network.airdrops.map(async (airdrop) => {
				if (!airdrop.active) {
					return;
				}
				const proof = await fetchData<AirdropMerkleClaim>(
					`${airdrop.endpoint}/${connectedAddress}`,
					'Unable to retrieve airdrop proof!',
				);
				if (!proof) {
					return;
				}
				const contract = new web3.eth.Contract(airdrop.airdropAbi, airdrop.airdropContract);
				const claimed = await contract.methods.isClaimed(proof.index).call();
				if (!claimed[0]) {
					this.airdrops.push({
						token: airdrop.token,
						amount: new BigNumber(proof.amount),
						airdropContract: airdrop.airdropContract,
						airdropAbi: airdrop.airdropAbi,
						proof: proof,
					});
				}
			}),
		);
	});

	// TODO: merkle proof typing
	claimAirdrops = action(
		async (airdropContract: string, airdropAbi: AbiItem[], proof: any): Promise<void> => {
			const { provider, connectedAddress } = this.store.wallet;
			const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;
			const { gasPrices, network } = this.store.network;

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
