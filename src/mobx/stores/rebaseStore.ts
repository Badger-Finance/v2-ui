import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { getNextRebase, getRebaseLogs } from '../utils/diggHelpers';
import { groupBy } from '../../utils/lodashToNative';
import { RebaseInfo } from 'mobx/model/rebase-info';

let batchCall: any = null;

class RebaseStore {
	private store!: RootStore;
	public rebase?: RebaseInfo;

	constructor(store: RootStore) {
		this.store = store;

		extendObservable(this, {
			rebase: this.rebase,
		});
	}

	fetchRebaseStats = action(async () => {
		let rebaseLog: any = null;
		const { network, provider } = this.store.wallet;

		if (!provider) {
			return;
		}

		const options = {
			web3: new Web3(provider),
			etherscan: {
				apiKey: 'NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P',
				delayTime: 300,
			},
		};
		batchCall = new BatchCall(options);
		rebaseLog = await getRebaseLogs(provider, network);

		if (!batchCall || !network.rebase) {
			return;
		}

		const diggData = await batchCall.execute(network.rebase.digg);
		const keyedResult = groupBy(diggData, (v) => v.namespace);

		if (!keyedResult.token || !keyedResult.token[0].decimals || !keyedResult.oracle[0].latestAnswer[0].value) {
			return;
		}

		const minRebaseTimeIntervalSec = parseInt(keyedResult.policy[0].minRebaseTimeIntervalSec[0].value);
		const lastRebaseTimestampSec = parseInt(keyedResult.oracle[0].latestTimestamp[0].value);
		const decimals = parseInt(keyedResult.token[0].decimals[0].value);
		this.rebase = {
			totalSupply: new BigNumber(keyedResult.token[0].totalSupply[0].value).dividedBy(Math.pow(10, decimals)),
			decimals,
			lastRebaseTimestampSec,
			minRebaseTimeIntervalSec,
			rebaseLag: keyedResult.policy[0].rebaseLag[0].value,
			epoch: keyedResult.policy[0].epoch[0].value,
			inRebaseWindow: false,
			rebaseWindowLengthSec: parseInt(keyedResult.policy[0].rebaseWindowLengthSec[0].value),
			oracleRate: !!keyedResult.oracle
				? new BigNumber(keyedResult.oracle[0].latestAnswer[0].value).dividedBy(1e8)
				: new BigNumber(1),
			nextRebase: getNextRebase(minRebaseTimeIntervalSec, lastRebaseTimestampSec),
			pastRebase: rebaseLog,
		};
	});
}

export default RebaseStore;
