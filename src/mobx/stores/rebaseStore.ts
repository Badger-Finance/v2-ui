import { action, extendObservable } from 'mobx';
import { getNextRebase, getRebaseLogs } from '../utils/diggHelpers';

import BatchCall from 'web3-batch-call';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';
import { RootStore } from '../store';
import Web3 from 'web3';
import _ from 'lodash';
import { estimateAndSend } from '../utils/web3';
import { graphQuery } from '../utils/helpers';

let batchCall: any = null;

class RebaseStore {
	private store!: RootStore;

	public rebase?: any; // rebase contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			rebase: {},
		});

		this.fetchRebaseStats();
		setInterval(() => {
			this.fetchRebaseStats();
			// this.getCurrentBlock()
		}, 30000);
	}

	fetchRebaseStats = action(async () => {
		let rebaseLog: any = null;
		const { network, provider } = this.store.wallet;

		if (provider) {
			const options = {
				web3: new Web3(provider),
				etherscan: {
					apiKey: 'NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P',
					delayTime: 300,
				},
			};

			batchCall = new BatchCall(options);

			rebaseLog = await getRebaseLogs(provider, network);
		} else {
			return;
		}

		if (!batchCall) return;
		if (!network.rebase) return;

		Promise.all([
			batchCall.execute(network.rebase.digg),
			...[...graphQuery(network.rebase.digg[0].addresses[0], this.store)],
		]).then((result: any[]) => {
			const keyedResult = _.groupBy(result[0], 'namespace');

			if (!keyedResult.token || !keyedResult.token[0].decimals || !keyedResult.oracle[0].providerReports[0].value)
				return;

			const minRebaseTimeIntervalSec = parseInt(keyedResult.policy[0].minRebaseTimeIntervalSec[0].value);
			const lastRebaseTimestampSec = parseInt(keyedResult.policy[0].lastRebaseTimestampSec[0].value);
			const decimals = parseInt(keyedResult.token[0].decimals[0].value);
			const token = {
				totalSupply: new BigNumber(keyedResult.token[0].totalSupply[0].value).dividedBy(Math.pow(10, decimals)),
				decimals: decimals,
				lastRebaseTimestampSec: lastRebaseTimestampSec,
				minRebaseTimeIntervalSec: minRebaseTimeIntervalSec,
				rebaseLag: keyedResult.policy[0].rebaseLag[0].value,
				epoch: keyedResult.policy[0].epoch[0].value,
				// inRebaseWindow: keyedResult.policy[0].inRebaseWindow[0].value !== 'N/A',
				inRebaseWindow: false,
				rebaseWindowLengthSec: parseInt(keyedResult.policy[0].rebaseWindowLengthSec[0].value),
				oracleRate: !!keyedResult.oracle
					? new BigNumber(keyedResult.oracle[0].providerReports[0].value.payload).dividedBy(1e18)
					: new BigNumber(1),
				derivedEth: result[1].data.token ? result[1].data.token.derivedETH : 0,
				nextRebase: getNextRebase(minRebaseTimeIntervalSec, lastRebaseTimestampSec),
				pastRebase: rebaseLog,
			};
			this.updateRebase(token);
		});
	});
	updateRebase = action((rebase: any) => {
		_.defaultsDeep(this.rebase, rebase);
	});

	callRebase = action(() => {
		const { provider, gasPrices, connectedAddress, network } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;
		if (!network.rebase) return;
		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const policy = new web3.eth.Contract(
			network.rebase.orchestrator.abi as any,
			network.rebase.orchestrator.contract,
		);
		const method = policy.methods.rebase();

		queueNotification(`Sign the transaction to rebase BADGER`, 'info');
		estimateAndSend(web3, gasPrices[gasPrice], method, connectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash) => {
					queueNotification(`Rebase submitted.`, 'info', hash);
				})
				.on('receipt', () => {
					queueNotification(`Rebase success.`, 'success');
					this.fetchRebaseStats();
				})
				.catch((error: any) => {
					queueNotification(error.message, 'error');
					setTxStatus('error');
				});
		});
	});
}

export default RebaseStore;
