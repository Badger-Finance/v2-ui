import { action, extendObservable } from 'mobx';
import { RootStore } from 'mobx/RootStore';
import { TimelockEvent } from '../model/governance-timelock/timelock-event';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import GovernanceTimelockAbi from '../../config/system/abis/GovernanceTimelock.json';

const getParameterTypes = (signature: string) => {
	const parametersStart = signature.indexOf('(') + 1;
	const parametersEnd = signature.lastIndexOf(')');
	const parameters = signature.substring(parametersStart, parametersEnd);
	return parameters.split(',');
};

export class GovernancePortalStore {
	public contractAddress?: string;
	public timelockEvents?: Map<string, TimelockEvent>;
	constructor(store: RootStore) {
		this.contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
		extendObservable(this, {
			timelockEvents: this.timelockEvents,
		});
	}

	loadData = action(async (): Promise<void> => {
		const provider = Web3.givenProvider;
		const web3 = new Web3(provider);
		const GovernanceContract = new web3.eth.Contract(GovernanceTimelockAbi as AbiItem[], this.contractAddress);
		const eventData = await GovernanceContract.getPastEvents('allEvents', {
			fromBlock: 0,
			toBlock: 'latest',
		});

		eventData.sort((a: any, b: any) => b.blockNumber + b.id - a.blockNumber + a.id);

		var timelockEventMap = new Map<string, TimelockEvent>();

		for (var eventitem of eventData) {
			if (eventitem.returnValues.id) {
				console.log(eventitem.returnValues);
				let id = eventitem.returnValues.id;
				const blockInfo = await web3.eth.getBlock(eventitem.blockNumber);
				var timestamp: any = blockInfo.timestamp;
				var date: any = new Date(timestamp * 1000);
				var s = date.toUTCString();
				var utcDate = s.substring(0, s.indexOf('GMT')) + 'UTC';
				var timelockEvent = {} as TimelockEvent;

				timelockEvent = timelockEventMap.get(id) || timelockEvent;
				timelockEvent.doneBy = eventitem.returnValues.sender || '';
				timelockEvent.status = eventitem.returnValues.status || '';
				timelockEvent.event = eventitem.event;
				timelockEvent.returnValues = eventitem.returnValues;
				timelockEvent.timeStamp = utcDate;
				timelockEvent.timeRemaining = 0;
				if (eventitem.returnValues.status == 'Proposed') {
					timelockEvent.proposer = timelockEvent.doneBy;
					timelockEvent.timeRemaining = eventitem.returnValues.delay - Math.round((new Date()).getTime() / 1000);
				}
				timelockEventMap.set(id, timelockEvent);
			}
		}
		this.timelockEvents = timelockEventMap;
	});
}
