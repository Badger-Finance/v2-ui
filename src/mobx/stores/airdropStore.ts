import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { estimateAndSend } from '../utils/web3';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { jsonQuery } from '../utils/helpers';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { sett_system } from '../../config/deployments/mainnet.json';
import { AirdropNetworkConfig } from '../model';

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
		const { provider, connectedAddress, network } = this.store.wallet;
		if (!connectedAddress) return;
		if (!network.airdrops) return;

		const bBadgerAddress = sett_system.vaults['native.badger'];
		const web3 = new Web3(provider);
		const bBadgerAirdropTree = new web3.eth.Contract(
			network.airdrops.airdropsConfig[bBadgerAddress].airdropAbi,
			network.airdrops.airdropsConfig[bBadgerAddress].airdropContract,
		);
		const checksumAddress = connectedAddress.toLowerCase();

		this.fetchAirdropsData(network.airdrops, checksumAddress)?.then((merkleProof: any) => {
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
		const { provider, gasPrices, connectedAddress, network } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;
		if (!network.airdrops) return;

		const web3 = new Web3(provider);
		const airdropTree = new web3.eth.Contract(
			network.airdrops.airdropsConfig[contract].airdropAbi,
			network.airdrops.airdropsConfig[contract].airdropContract,
		);
		const method = airdropTree.methods.claim(
			merkleProof.index,
			connectedAddress,
			merkleProof.amount,
			merkleProof.proof,
		);

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

	fetchAirdropsData(config: AirdropNetworkConfig, checksumAddress: string): Promise<Response> | undefined {
		return jsonQuery(`${config.airdropEndpoint}/gitcoin/${checksumAddress}`);
	}
}

export default AirdropStore;
