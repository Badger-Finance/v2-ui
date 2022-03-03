import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { TimelockEvent } from '../model/governance-timelock/timelock-event';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import GovernanceTimelockAbi from '../../config/system/abis/GovernanceTimelock.json';
import { idText } from 'typescript';

const getParameterTypes = (signature: string) => {
	const parametersStart = signature.indexOf('(') + 1;
	const parametersEnd = signature.lastIndexOf(')');
	const parameters = signature.substring(parametersStart, parametersEnd);
	return parameters.split(',');
};


export class GovernancePortalStore {
	private store: RootStore;

	public contractAddress?: string;
	// public adminAddress?: string;
	// public guardianAddress?: string;
	public timelockEvents?: Map<string, TimelockEvent>;

	constructor(store: RootStore) {
		this.store = store;
		this.contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

		extendObservable(this, {
			timelockEvents: this.timelockEvents,
		});
	}

	loadData = action(
		async (): Promise<void> => {
			const provider = Web3.givenProvider;
			const web3 = new Web3(provider);
			const GovernanceContract = new web3.eth.Contract(GovernanceTimelockAbi as AbiItem[], this.contractAddress);

			// this.adminAddress = await GovernanceContract.methods.admin().call();
			// this.guardianAddress = await GovernanceContract.methods.guardian().call();

			const eventData = await GovernanceContract.getPastEvents('allEvents', {
				fromBlock: 0,
				toBlock: 'latest',
			});
			console.log(eventData);

			eventData.sort((a: any, b: any) => b.blockNumber + b.id - a.blockNumber + a.id);
			// 	.map((eventData) => {
			// const block = await web3.eth.getBlock(eventData.blockNumber)

			var timelockEventMap = new Map<string, TimelockEvent>();
			for (var eventitem of eventData) {
				if (eventitem.returnValues.id) {
					console.log("hi");
					let id = eventitem.returnValues.id;
					var timelockEvent = {} as TimelockEvent;
					timelockEvent = timelockEventMap.get(id) || timelockEvent;
					timelockEvent.blockNumber = eventitem.blockNumber;
					if (eventitem.returnValues.data) {
						console.log();
					}

					timelockEvent.doneBy = eventitem.returnValues.sender || '';
					timelockEvent.status = web3.utils.hexToAscii(eventitem.returnValues.status) || '';
					timelockEvent.event = eventitem.event;
					timelockEvent.returnValues = eventitem.returnValues;

					// try {
					// 	const functionName = eventitem.returnValues.data.substring(0, 10);
					// 	// console.log(functionName);
					// 	const signature = ""
					// 	timelockEvent.functionName = web3.utils.hexToAscii(functionName);
					// 	// console.log(timelockEvent.functionName, "-----");
					// 	timelockEvent.parameterTypes = getParameterTypes(signature);
					// 	timelockEvent.decodedParameters = web3.eth.abi.decodeParameters(
					// 		timelockEvent.parameterTypes,
					// 		eventitem.returnValues.data,
					// 	);
					// } catch (e) {
					// 	console.log((e as Error).message);
					// 	timelockEvent.decodedParameters = null;
					// }
					// console.log(eventitem.returnValues.status, web3.eth.abi.encodeParameter('bytes32', web3.utils.fromAscii('Proposed')))
					if (eventitem.returnValues.status == web3.eth.abi.encodeParameter('bytes32', web3.utils.fromAscii('Proposed'))) {
						timelockEvent.proposer = timelockEvent.doneBy;
					}
					timelockEventMap.set(id, timelockEvent);
				}
			}
			this.timelockEvents = timelockEventMap;
			console.log(timelockEventMap)

		},
	);
}
