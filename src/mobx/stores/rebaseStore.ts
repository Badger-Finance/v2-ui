import { extendObservable, action } from 'mobx';
import { RootStore } from '../RootStore';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';
import DroptRedemption from '../../config/system/abis/DroptRedemption.json';
import { getSendOptions, sendContractMethod } from 'mobx/utils/web3';
import { BigNumber } from 'ethers';

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

		// rebaseLog = await getRebaseLogs(provider, network);

		// const rebaseConfig = getRebase(network.symbol);
		// if (!batchCall || !rebaseConfig) {
		// 	return;
		// }

		// const diggData = await batchCall.execute(rebaseConfig.digg);
		// const keyedResult = Object.fromEntries(diggData.map((item: BatchCallRequest) => [item.namespace, item]));
		// const { policy, token, oracle, dropt } = keyedResult;

		// if (!this.hasCallResults(token) || !this.hasCallResults(policy) || !this.hasCallResults(oracle)) {
		// 	return;
		// }

		// // dropt data
		// const validDropts = dropt
		// 	.filter(
		// 		(_dropt: DroptContractResponse) =>
		// 			Number(_dropt.expirationTimestamp[0].value) < Number(_dropt.getCurrentTime[0].value) &&
		// 			Number(_dropt.expiryPrice[0].value) > 0,
		// 	)
		// 	.map((validDropt: DroptContractResponse) => {
		// 		return {
		// 			[validDropt['address']]: {
		// 				expiryPrice: validDropt.expiryPrice[0].value,
		// 				expirationTimestamp: validDropt.expirationTimestamp[0].value,
		// 				currentTimestamp: validDropt.getCurrentTime[0].value,
		// 			},
		// 		};
		// 	});

		// // policy data
		// const latestRebase = Number(policy[0].lastRebaseTimestampSec[0].value);
		// const minRebaseInterval = Number(policy[0].minRebaseTimeIntervalSec[0].value);

		// // token data
		// const decimals = parseInt(token[0].decimals[0].value);
		// const totalSupply = BigNumber.from(token[0].totalSupply[0].value).div(Math.pow(10, decimals));
		// const sharesPerFragment = BigNumber.from(token[0]._sharesPerFragment[0].value);

		// // pull latest provider report
		// const oracleReport: OracleReports = oracle[0];
		// let activeReport: ProviderReport = oracleReport.providerReports[0];
		// oracleReport.providerReports.forEach((report: ProviderReport) => {
		// 	const moreRecentReport = Number(report.value.timestamp) > Number(activeReport.value.timestamp);
		// 	if (moreRecentReport) {
		// 		activeReport = report;
		// 	}
		// });

		// this.rebase = {
		// 	totalSupply,
		// 	latestRebase,
		// 	minRebaseInterval,
		// 	sharesPerFragment,
		// 	latestAnswer: Number(activeReport.value.timestamp),
		// 	inRebaseWindow: policy[0].inRebaseWindow[0].value,
		// 	rebaseLag: policy[0].rebaseLag[0].value,
		// 	epoch: policy[0].epoch[0].value,
		// 	rebaseWindowLengthSec: parseInt(policy[0].rebaseWindowLengthSec[0].value),
		// 	oracleRate: BigNumber.from(activeReport.value.payload).div(1e18),
		// 	nextRebase: getNextRebase(minRebaseInterval, latestRebase),
		// 	pastRebase: rebaseLog,
		// 	validDropts: validDropts,
		// };
	});

	private hasCallResults(results: any[]): boolean {
		return !!results && results.length > 0;
	}

	public async redeemDropt(redemptionContract: string, redeemAmount: BigNumber): Promise<void> {
		if (redeemAmount.lte(0)) {
			return;
		}
		const { queueNotification, gasPrice } = this.store.uiState;
		const { provider, connectedAddress } = this.store.wallet;
		const { gasPrices } = this.store.network;

		// const web3 = new Web3(provider);
		// const redemption = new web3.eth.Contract(DroptRedemption.abi as AbiItem[], redemptionContract);
		// const method = redemption.methods.settle(redeemAmount.toString(), '0');

		// queueNotification(`Sign the transaction to claim your options`, 'info');

		// const price = gasPrices ? gasPrices[gasPrice] : 0;
		// const options = await getSendOptions(method, connectedAddress, price);
		// await sendContractMethod(this.store, method, options, `Claim submitted.`, `Options claimed.`);
	}
}

export default RebaseStore;
