import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../RootStore';
import { AbiItem } from 'web3-utils';
import { getSendOptions, sendContractMethod } from 'mobx/utils/web3';
import { AirdropMerkleClaim } from 'mobx/model/rewards/airdrop-merkle-claim';
import { fetchData } from '../../utils/fetchData';
import { DEBUG } from '../../config/environment';

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
		const { onboard } = this.store;
		const { network } = this.store.network;
		if (onboard.isActive() || !network.airdrops) {
			return;
		}

		const web3 = new Web3(onboard.wallet?.provider);
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

				const [proof] = await fetchData<AirdropMerkleClaim>(`${airdrop.endpoint}/${onboard.address}`);

				if (!proof) {
					if (DEBUG) {
						this.store.uiState.queueError('Unable to retrieve airdrop proof!');
					}
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

	claimAirdrops = action(
		async (airdropContract: string, airdropAbi: AbiItem[], claim: AirdropMerkleClaim): Promise<void> => {
			const { wallet, address, isActive } = this.store.onboard;
			const { queueNotification, gasPrice } = this.store.uiState;
			const { gasPrices, network } = this.store.network;

			if (isActive() || !address || !network.airdrops || !claim.proof) {
				return;
			}

			const web3 = new Web3(wallet?.provider);
			const airdropTree = new web3.eth.Contract(airdropAbi, airdropContract);
			const method = airdropTree.methods.claim(claim.index, address, claim.amount, claim.proof);

			queueNotification(`Sign the transaction to claim your airdrop`, 'info');
			if (!gasPrices || !gasPrices[gasPrice]) {
				queueNotification(
					`Error retrieving gas selection - check the gas selector in the top right corner.`,
					'error',
				);
				return;
			}

			const price = gasPrices[gasPrice];
			const options = await getSendOptions(method, address, price);
			await sendContractMethod(this.store, method, options, `Claim submitted.`, `Aidrop claimed.`);
		},
	);
}

export default AirdropStore;
