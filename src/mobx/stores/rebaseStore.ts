import { extendObservable, action } from 'mobx';
import Web3 from 'web3';
import { RootStore } from '../RootStore';
import { getNextRebase, getRebaseLogs } from '../utils/diggHelpers';
import { RebaseInfo } from 'mobx/model/tokens/rebase-info';
import DroptRedemption from '../../config/system/abis/DroptRedemption.json';
import { AbiItem } from 'web3-utils';
import { getSendOptions, sendContractMethod } from 'mobx/utils/web3';
import { ProviderReport } from 'mobx/model/digg/provider-reports';
import { getRebase } from 'config/system/rebase';
import BigNumber from 'bignumber.js';
import { groupBy } from 'utils/lodashToNative';
import { getChainMulticallContract, parseCallReturnContext } from '../utils/multicall';
import { Multicall } from 'ethereum-multicall';
import { ContractCallReturnContext } from 'ethereum-multicall/dist/esm/models/contract-call-return-context';

class RebaseStore {
	private store: RootStore;
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

		rebaseLog = await getRebaseLogs(provider, network);

		const rebaseConfig = getRebase(network.symbol);

		if (!rebaseConfig) {
			return;
		}

		const multicallContractAddress = getChainMulticallContract(network.symbol);

		const multicall = new Multicall({
			web3Instance: new Web3(provider),
			tryAggregate: true,
			multicallCustomContractAddress: multicallContractAddress,
		});

		const diggData = await multicall.call(rebaseConfig.digg);

		const keyedResult = groupBy(diggData.results, (v) => v.originalContractCallContext.context.namespace);

		const { policy, token, oracle, dropt } = keyedResult;

		if (!this.hasCallResults(token) || !this.hasCallResults(policy) || !this.hasCallResults(oracle)) {
			return;
		}

		// dropt data
		const validDropts = dropt
			.filter((context: ContractCallReturnContext) => {
				const _dropt = parseCallReturnContext(context.callsReturnContext);

				return (
					Number(_dropt.expirationTimestamp[0][0].hex) < Number(_dropt.getCurrentTime[0][0].hex) &&
					Number(_dropt.expiryPrice[0][0].hex) > 0
				);
			})
			.map((context: ContractCallReturnContext) => {
				const {
					callsReturnContext,
					originalContractCallContext: { contractAddress },
				} = context;

				const validDropt = parseCallReturnContext(callsReturnContext);

				return {
					[contractAddress]: {
						expiryPrice: validDropt.expiryPrice[0][0].hex,
						expirationTimestamp: Number(validDropt.expirationTimestamp[0][0].hex).toString(),
						currentTimestamp: Number(validDropt.getCurrentTime[0][0].hex).toString(),
					},
				};
			});

		// policy data

		const policyData = parseCallReturnContext(policy[0].callsReturnContext);
		const latestRebase = Number(policyData.lastRebaseTimestampSec[0][0].hex);
		const minRebaseInterval = Number(policyData.minRebaseTimeIntervalSec[0][0].hex);

		// token data
		const tokenData = parseCallReturnContext(token[0].callsReturnContext);

		const decimals = parseInt(tokenData.decimals[0][0]);
		const totalSupply = new BigNumber(tokenData.totalSupply[0][0].hex).dividedBy(Math.pow(10, decimals));
		const sharesPerFragment = new BigNumber(tokenData._sharesPerFragment[0][0].hex);

		// pull latest provider report
		const oracleReport = parseCallReturnContext(oracle[0].callsReturnContext);

		let activeReport = oracleReport.providerReports[0];

		oracleReport.providerReports.forEach((report: ProviderReport) => {
			const moreRecentReport = Number(report[0].hex) > Number(activeReport[0].hex);
			if (moreRecentReport) {
				activeReport = report;
			}
		});

		this.rebase = {
			totalSupply,
			latestRebase,
			minRebaseInterval,
			sharesPerFragment,
			latestAnswer: Number(activeReport[0].hex),
			inRebaseWindow: policyData.inRebaseWindow[0][0],
			rebaseLag: Number(policyData.rebaseLag[0][0].hex),
			epoch: Number(policyData.epoch[0][0].hex),
			rebaseWindowLengthSec: parseInt(policyData.rebaseWindowLengthSec[0][0].hex),
			oracleRate: new BigNumber(activeReport[1].hex).dividedBy(1e18),
			nextRebase: getNextRebase(minRebaseInterval, latestRebase),
			pastRebase: rebaseLog,
			validDropts: validDropts,
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
		const { provider, connectedAddress } = this.store.wallet;
		const { gasPrices } = this.store.network;

		const web3 = new Web3(provider);
		const redemption = new web3.eth.Contract(DroptRedemption.abi as AbiItem[], redemptionContract);
		const method = redemption.methods.settle(redeemAmount.toString(10), '0');

		queueNotification(`Sign the transaction to claim your options`, 'info');

		const price = gasPrices ? gasPrices[gasPrice] : 0;
		const options = await getSendOptions(method, connectedAddress, price);
		await sendContractMethod(this.store, method, options, `Claim submitted.`, `Options claimed.`);
	}
}

export default RebaseStore;
