import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import { RootStore } from '../RootStore';
import { getNextRebase, getRebaseLogs } from '../utils/diggHelpers';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';
import { ProviderReport } from 'mobx/model/digg/provider-reports';
import { OracleReports } from 'mobx/model/digg/oracle';
import { getRebase } from 'config/system/rebase';
import BigNumber from 'bignumber.js';
import { groupBy } from 'utils/lodashToNative';

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
		const { provider } = this.store.wallet;
		const { network } = this.store.network;

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

		const rebaseConfig = getRebase(network.symbol);
		if (!batchCall || !rebaseConfig) {
			return;
		}

		const diggData = await batchCall.execute(rebaseConfig.digg);
		const keyedResult = groupBy(diggData, (v) => v.namespace);
		const { policy, token, oracle } = keyedResult;

		if (!this.hasCallResults(token) || !this.hasCallResults(policy) || !this.hasCallResults(oracle)) {
			return;
		}

		// policy data
		const latestRebase = Number(policy[0].lastRebaseTimestampSec[0].value);
		const minRebaseInterval = Number(policy[0].minRebaseTimeIntervalSec[0].value);

		// token data
		const decimals = parseInt(token[0].decimals[0].value);
		const totalSupply = new BigNumber(token[0].totalSupply[0].value).dividedBy(Math.pow(10, decimals));

		// pull latest provider report
		const oracleReport: OracleReports = oracle[0];
		let activeReport: ProviderReport = oracleReport.providerReports[0];
		oracleReport.providerReports.forEach((report: ProviderReport) => {
			const moreRecentReport = Number(report.value.timestamp) > Number(activeReport.value.timestamp);
			if (moreRecentReport) {
				activeReport = report;
			}
		});

		this.rebase = {
			totalSupply,
			latestRebase,
			minRebaseInterval,
			latestAnswer: Number(activeReport.value.timestamp),
			inRebaseWindow: policy[0].inRebaseWindow[0].value,
			rebaseLag: policy[0].rebaseLag[0].value,
			epoch: policy[0].epoch[0].value,
			rebaseWindowLengthSec: parseInt(policy[0].rebaseWindowLengthSec[0].value),
			oracleRate: new BigNumber(activeReport.value.payload).dividedBy(1e18),
			nextRebase: getNextRebase(minRebaseInterval, latestRebase),
			pastRebase: rebaseLog,
		};
	});

	private hasCallResults(results: any[]): boolean {
		return !!results && results.length > 0;
	}
}

export default RebaseStore;
