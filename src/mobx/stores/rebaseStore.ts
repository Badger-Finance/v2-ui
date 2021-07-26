import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import BatchCall from 'web3-batch-call';
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import { getNextRebase, getRebaseLogs } from '../utils/diggHelpers';
import { groupBy } from '../../utils/lodashToNative';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';
import Dropt2Redemption from '../../config/system/abis/Dropt2Redemption.json';
import { AbiItem } from 'web3-utils';
import { getSendOptions } from 'mobx/utils/web3';

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
		const { policy, token, oracle, dropt } = keyedResult;

		console.log('dropt:', dropt);

		if (!this.hasCallResults(token) || !this.hasCallResults(policy) || !this.hasCallResults(oracle)) {
			return;
		}

		// dropt data
		const expirationTimestamp = Number(dropt[0].expirationTimestamp[0].value);
		const dropt2CurrentTimestamp = Number(dropt[0].expirationTimestamp[0].value);
		const expiryPrice = dropt[0].expiryPrice[0].value;

		// policy data
		const latestRebase = Number(policy[0].lastRebaseTimestampSec[0].value);
		const minRebaseInterval = Number(policy[0].minRebaseTimeIntervalSec[0].value);

		// token data
		const decimals = parseInt(token[0].decimals[0].value);
		const totalSupply = new BigNumber(token[0].totalSupply[0].value).dividedBy(Math.pow(10, decimals));

		this.rebase = {
			totalSupply,
			latestRebase,
			minRebaseInterval,
			latestAnswer: oracle[0].providerReports[0].value.timestamp,
			inRebaseWindow: policy[0].inRebaseWindow[0].value,
			rebaseLag: policy[0].rebaseLag[0].value,
			epoch: policy[0].epoch[0].value,
			rebaseWindowLengthSec: parseInt(policy[0].rebaseWindowLengthSec[0].value),
			oracleRate: new BigNumber(oracle[0].providerReports[0].value.payload).dividedBy(1e18),
			nextRebase: getNextRebase(minRebaseInterval, latestRebase),
			pastRebase: rebaseLog,
			expirationTimestamp: new Date(expirationTimestamp * 1000),
			expiryPrice: new BigNumber(expiryPrice).dividedBy(1e18),
			dropt2CurrentTimestamp: new Date(dropt2CurrentTimestamp * 1000),
		};
	});

	private hasCallResults(results: any[]): boolean {
		return !!results && results.length > 0;
	}

	public async redeemDropt(redemptionContract: string, redeemAmount: BigNumber): Promise<void> {
		if (redeemAmount.lte(0)) {
			return;
		}
		const { queueNotification, gasPrice } = this.store.uiState;
		const { provider, gasPrices, connectedAddress } = this.store.wallet;

		const web3 = new Web3(provider);
		const redemption = new web3.eth.Contract(Dropt2Redemption.abi as AbiItem[], redemptionContract);
		const method = redemption.methods.redeem(redeemAmount);

		queueNotification(`Sign the transaction to claim your options`, 'info');

		const price = gasPrices[gasPrice];
		const options = await getSendOptions(method, connectedAddress, price);
		await method
			.send(options)
			.on('transactionHash', (_hash: string) => {
				queueNotification(`Claim submitted.`, 'info', _hash);
			})
			.on('receipt', () => {
				queueNotification(`Options claimed.`, 'success');
				this.store.user.updateBalances();
			})
			.on('error', (error: Error) => {
				queueNotification(error.message, 'error');
			});
	}
}

export default RebaseStore;
