import { extendObservable, action, observe } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';

import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';

import { graphQuery } from '../utils/helpers';
import { estimateAndSend } from '../utils/web3';
import { RPC_URL } from '../../config/constants';
import { orchestrator } from '../../config/system/rebase';
import { getNextRebase, getRebaseLogs } from '../utils/diggHelpers';

const infuraProvider = new Web3.providers.HttpProvider(RPC_URL);
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: 'NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P',
		delayTime: 300,
	},
};

let batchCall = new BatchCall(options);

class RebaseStore {
	private store!: RootStore;

	public rebase?: any; // rebase contract data

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			rebase: undefined,
		});
	}

	fetchRebaseStats = action(async () => {
		const rebaseLog = await getRebaseLogs();
		const { digg } = require('config/system/rebase');
		Promise.all([batchCall.execute(digg), ...[...graphQuery(digg[0].addresses[0])]]).then(
			(result: any[]) => {
				let keyedResult = _.groupBy(result[0], 'namespace');
				// console.log(keyedResult)

				if (!keyedResult.token || !keyedResult.token[0].decimals || !keyedResult.oracle) return;

				const minRebaseTimeIntervalSec = parseInt(keyedResult.policy[0].minRebaseTimeIntervalSec[0].value);
				const lastRebaseTimestampSec = parseInt(keyedResult.policy[0].lastRebaseTimestampSec[0].value);
				const decimals = parseInt(keyedResult.token[0].decimals[0].value);
				let token = {
					totalSupply: new BigNumber(keyedResult.token[0].totalSupply[0].value).dividedBy(
						Math.pow(10, decimals),
					),
					decimals: decimals,
					lastRebaseTimestampSec: lastRebaseTimestampSec,
					minRebaseTimeIntervalSec: minRebaseTimeIntervalSec,
					rebaseLag: keyedResult.policy[0].rebaseLag[0].value,
					epoch: keyedResult.policy[0].epoch[0].value,
					inRebaseWindow: keyedResult.policy[0].inRebaseWindow[0].value !== 'N/A',
					rebaseWindowLengthSec: parseInt(keyedResult.policy[0].rebaseWindowLengthSec[0].value),
					oracleRate: new BigNumber(keyedResult.oracle[0].providerReports[0].value.payload).dividedBy(1e18),
					derivedEth: result[1].data.token ? result[1].data.token.derivedETH : 0,
					nextRebase: getNextRebase(minRebaseTimeIntervalSec, lastRebaseTimestampSec),
					pastRebase: rebaseLog,
				};
				// console.log(token);
				this.updateRebase(token);
			},
		);
	});
	updateRebase = action((rebase: any) => {
		this.rebase = _.defaultsDeep(rebase, this.rebase, rebase);
	});

	callRebase = action(() => {
		const { provider, gasPrices, connectedAddress } = this.store.wallet;
		const { queueNotification, gasPrice, setTxStatus } = this.store.uiState;

		if (!connectedAddress) return;
		// if (ethBalance?.lt(MIN_ETH_BALANCE))
		// 	return queueNotification("Your account is low on ETH, you may need to top up to claim.", 'warning')

		const web3 = new Web3(provider);
		const policy = new web3.eth.Contract(orchestrator.abi as any, orchestrator.contract);
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
